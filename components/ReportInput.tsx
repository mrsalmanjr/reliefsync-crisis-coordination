'use client'

import { useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Upload, SendIcon, Radio } from 'lucide-react'

export function ReportInput() {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitReport = useCrisisStore((state) => state.submitReport)

  const handleSubmit = async () => {
    if (!text.trim()) return

    setIsSubmitting(true)
    submitReport(text)
    setText('')

    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  const handleVoiceInput = () => {
    const mockVoiceText =
      '12 people injured need urgent medical help near Bangalore Central Hospital'
    setText(mockVoiceText)
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  return (
    <div className="glass rounded-xl p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Crisis Report</h2>
            <p className="text-xs text-muted-foreground">AI-powered incident parsing</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Describe the crisis situation... (e.g., 8 people injured need urgent medical help near Bangalore)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32 glass border-white/10 rounded-lg focus-visible:ring-accent resize-none"
        />

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="flex-1 bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-600 text-primary-foreground font-semibold transition-all"
          >
            <SendIcon className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Parsing...' : 'Submit Report'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            title="Voice input"
            className="glass-hover rounded-lg"
          >
            <Mic className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            title="Upload file"
            className="glass-hover rounded-lg"
          >
            <label className="cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Include: number of people, need type (medical/food/shelter), location, and urgency keywords
        </p>
      </div>
    </div>
  )
}
