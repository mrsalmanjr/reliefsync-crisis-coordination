'use client'

import { useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Mic, Upload } from 'lucide-react'

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
    // Simulate voice input
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
      // Simple CSV parsing simulation
      const lines = content.split('\n').slice(0, 3) // Get first 3 lines
      setText(lines.join(' | '))
    }
    reader.readAsText(file)
  }

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Report Crisis</h2>

      <Textarea
        placeholder="Describe the crisis situation... (e.g., 8 people injured need urgent medical help near Bangalore)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-32"
      />

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Processing...' : 'Submit Report'}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleVoiceInput}
          title="Simulate voice input"
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button variant="outline" size="icon" asChild title="Upload CSV">
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

      <p className="text-sm text-gray-500">
        Include: number of people, need type (medical/food/shelter), location,
        and urgency keywords
      </p>
    </Card>
  )
}
