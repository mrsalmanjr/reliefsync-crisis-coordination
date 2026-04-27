'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Brain, TrendingUp, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function PredictiveInsights() {
  const insights = useCrisisStore((state) => state.insights)

  if (insights.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          AI Predictive Analysis
        </h3>
        <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent text-[10px] animate-pulse">
          Processing Real-time
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-5 border border-accent/20 bg-accent/[0.02] relative overflow-hidden group"
          >
            {/* Background scan effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/[0.03] to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-tighter text-accent">{insight.location}</p>
                  <h4 className="text-lg font-bold text-foreground leading-tight">{insight.title}</h4>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                  insight.riskLevel === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  insight.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  {insight.riskLevel} Risk
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.description}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground uppercase font-bold tracking-widest">Confidence Score</span>
                  <span className="text-accent font-black">{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="h-1 bg-white/5" indicatorClassName="bg-accent" />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Recommended Prep</span>
                </div>
                <p className="text-[11px] font-bold text-foreground">{insight.prepAction}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
