'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCrisisStore } from '@/store/crisisStore'

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [reportText, setReportText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitReport = useCrisisStore((state) => state.submitReport)

  const handleSubmit = async () => {
    if (!reportText.trim()) return

    setIsSubmitting(true)
    submitReport(reportText)
    setReportText('')
    setIsOpen(false)

    setTimeout(() => {
      setIsSubmitting(false)
    }, 300)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-blue-500 hover:from-accent hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
        aria-label="Quick report"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md glass border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Report Crisis</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Describe the emergency situation. Our AI will analyze and prioritize it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="E.g., 8 people injured near hospital, need medical help immediately..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-32 glass border-white/10 rounded-lg focus-visible:ring-accent resize-none"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!reportText.trim() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-600 text-white font-semibold"
              >
                {isSubmitting ? 'Analyzing...' : 'Submit Report'}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Include: number of people, type (medical/food/shelter), location, and urgency keywords
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
