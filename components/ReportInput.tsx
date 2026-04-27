'use client'

import { useState, useEffect } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Report } from '@/types'
import { parseReport } from '@/core/ai/parser'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Mic, Upload, SendIcon, Radio, Bot, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function ReportInput() {
  const [isListening, setIsListening] = useState(false)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<null | {
    category: string
    priority: string
    people: number
    action: string
    confidence: number
    useFallback: boolean
  }>(null)

  const submitParsedReport = useCrisisStore((state) => state.submitParsedReport)
  const addNotification = useCrisisStore((state) => state.addNotification)
  const initialReportDraft = useCrisisStore((state) => state.initialReportDraft)
  const setInitialReportDraft = useCrisisStore((state) => state.setInitialReportDraft)

  useEffect(() => {
    if (initialReportDraft) {
      setText(`Incident at ${initialReportDraft.location}: `)
      setInitialReportDraft(null)
    }
  }, [initialReportDraft, setInitialReportDraft])

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const mockVoiceText = '12 people injured need urgent medical help near Bangalore Central Hospital'
      setText(mockVoiceText)
      addNotification('Speech recognition not supported in this browser. Using mock input.', 'update')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      addNotification('Listening...', 'update')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setText(prev => (prev ? prev + ' ' + transcript : transcript))
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const handleSubmit = async () => {
    if (!text.trim()) return

    const settings = useCrisisStore.getState().settings
    setIsSubmitting(true)
    setAiAnalysis(null)
    const startTime = Date.now()

    console.log('[ReliefSync UI] INPUT:', text)
    console.log('[ReliefSync UI] Mode:', settings.systemMode)

    // DEMO MODE: Local Processing
    if (settings.systemMode === 'demo') {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const report: Report = {
        id: `report-${Date.now()}`,
        rawText: text,
        createdAt: new Date(),
        processed: true
      }
      const parsedReport = parseReport(text, report.id)
      parsedReport.confidence = 94

      console.log('[ReliefSync UI] DEMO PARSED:', parsedReport)
      
      submitParsedReport(report, parsedReport)
      setAiAnalysis({
        category: parsedReport.type[0],
        priority: parsedReport.urgency.level || 'medium',
        people: parsedReport.people,
        action: parsedReport.action || 'Deploy rapid assessment team.',
        confidence: 94,
        useFallback: true,
      })
      setText('')
      setIsSubmitting(false)
      return
    }

    // LIVE MODE: Real Gemini API Integration
    try {
      console.log('[ReliefSync UI] Calling /api/analyze...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const result = await response.json()
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, 1500 - elapsed)
      await new Promise(resolve => setTimeout(resolve, delay))

      console.log('[ReliefSync UI] AI RESPONSE:', result)

      if (result.analysis) {
        const analysis = result.analysis
        const report: Report = {
          id: `report-${Date.now()}`,
          rawText: text,
          createdAt: new Date(),
          processed: true
        }

        // Normalize priority to lowercase for internal use
        const priorityNorm = (analysis.priority || 'medium').toLowerCase() as 'low' | 'medium' | 'high'
        const people = analysis.peopleAffected ?? analysis.people ?? 1

        const parsedReport: ParsedReport = {
          id: `parsed-${Date.now()}`,
          reportId: report.id,
          type: [analysis.category],
          people,
          location: analysis.location || 'Reported Zone',
          action: analysis.action || analysis.recommended_action || 'Deploy assessment team.',
          confidence: analysis.confidence || 85,
          createdAt: new Date(),
          keywords: [analysis.category, analysis.location].filter(Boolean),
          urgency: { score: priorityNorm === 'high' ? 90 : priorityNorm === 'medium' ? 60 : 30, level: priorityNorm }
        }
        
        console.log('[ReliefSync UI] PARSED REPORT:', parsedReport)
        submitParsedReport(report, parsedReport)
        
        setAiAnalysis({
          category: analysis.category,
          priority: priorityNorm,
          people,
          action: analysis.action || analysis.recommended_action || 'Deploy assessment team.',
          confidence: analysis.confidence || 85,
          useFallback: !!result.mock || !!result.apiError || !!result.parseError,
        })

        if (priorityNorm === 'high') {
          addNotification('AUTO-DISPATCH ACTIVATED: High priority crisis detected', 'assignment')
        }
      }
      setText('')
    } catch (error) {
      console.error('[ReliefSync UI] API call failed, using local fallback:', error)
      // Fallback to local parser — NEVER leave UI empty
      const report: Report = {
        id: `report-${Date.now()}`,
        rawText: text,
        createdAt: new Date(),
        processed: true
      }
      const parsedReport = parseReport(text, report.id)
      parsedReport.confidence = 72

      submitParsedReport(report, parsedReport)
      setAiAnalysis({
        category: parsedReport.type[0],
        priority: parsedReport.urgency.level || 'medium',
        people: parsedReport.people,
        action: parsedReport.action || 'Deploy rapid assessment team.',
        confidence: 72,
        useFallback: true,
      })
      addNotification('AI service unavailable. Local classification applied.', 'update')
      setText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n').slice(0, 3)
      setText(lines.join(' | '))
    }
    reader.readAsText(file)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="glass rounded-xl p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Operational Intelligence</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase opacity-60">AI-Powered Incident Extraction</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-accent/5 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <Textarea
            placeholder="ENTER CRISIS DATA: e.g., 'Flash flood reported in North Sector, 10 civilians trapped...'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 bg-black/40 border border-white/10 rounded-lg focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent resize-none relative z-10 transition-all placeholder:text-muted-foreground/30"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => {
              useCrisisStore.getState().triggerAudio('ping')
              handleSubmit()
            }}
            disabled={!text.trim() || isSubmitting}
            className="flex-1 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-95 group relative overflow-hidden h-14"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {isSubmitting ? 'AI analyzing multi-source inputs...' : 'Initiate Intelligence Extraction'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            title="Voice input"
            className={`glass-hover rounded-lg relative overflow-hidden ${isListening ? 'text-accent border-accent/40' : ''}`}
          >
            {isListening && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-accent rounded-full"
              />
            )}
            <Mic className={`w-4 h-4 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
          </Button>

          <Button variant="ghost" size="icon" asChild title="Upload file" className="glass-hover rounded-lg">
            <label className="cursor-pointer">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Include: number of people, need type (medical/food/shelter), location, and urgency keywords
        </p>
      </div>

      {isSubmitting && (
        <div className="glass rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Analyzing with AI...</p>
              <p className="text-xs text-muted-foreground">Processing crisis data</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full bg-accent/20" />
                <Skeleton className="h-3 w-32 bg-white/10" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-accent/50 animate-shimmer rounded-full" />
            </Skeleton>
          </div>
        </div>
      )}

      {!isSubmitting && aiAnalysis && (
        <div className="glass rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">AI Decision Engine (Gemini)</p>
              <p className="text-xs text-muted-foreground">
                Confidence: <span className="text-accent font-bold">{aiAnalysis.confidence}%</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-lg font-bold text-foreground capitalize">{aiAnalysis.category}</p>
            </div>
            <div className="glass rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(aiAnalysis.priority)}`}>
                {aiAnalysis.priority.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="glass rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Suggested Action</p>
            <p className="text-sm font-medium text-foreground">{aiAnalysis.action}</p>
          </div>
        </div>
      )}
    </div>
  )
}