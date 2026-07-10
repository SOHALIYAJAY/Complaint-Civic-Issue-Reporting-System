'use client'

import { CheckCircle2, Clock, Loader2, Circle } from 'lucide-react'

export interface StatusHistoryEntry {
  status: string
  remarks: string
  timestamp: string
  changed_by: string
}

interface StatusTimelineProps {
  currentStatus: string
  submittedAt?: string
  history?: StatusHistoryEntry[]
}

const STAGES = [
  {
    key: 'Pending',
    label: 'Pending',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    activeBg: 'bg-yellow-400',
    dot: 'bg-yellow-400',
    connectorActive: 'bg-yellow-300',
  },
  {
    key: 'In Process',
    label: 'In Process',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    activeBg: 'bg-blue-500',
    dot: 'bg-blue-500',
    connectorActive: 'bg-blue-300',
  },
  {
    key: 'Completed',
    label: 'Completed',
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-500',
    activeBg: 'bg-green-500',
    dot: 'bg-green-500',
    connectorActive: 'bg-green-300',
  },
]

// Normalize legacy status values
function normalizeStatus(s: string): string {
  const map: Record<string, string> = {
    'in-progress': 'In Process',
    'in_progress': 'In Process',
    'resolved':    'Completed',
    'pending':     'Pending',
  }
  return map[s.toLowerCase()] ?? s
}

function stageIndex(status: string): number {
  const norm = normalizeStatus(status)
  return STAGES.findIndex(s => s.key === norm)
}

export default function StatusTimeline({ currentStatus, submittedAt, history = [] }: StatusTimelineProps) {
  const currentIdx = stageIndex(currentStatus)

  // Build a map: stage key → latest history entry for that stage
  const historyMap: Record<string, StatusHistoryEntry> = {}
  for (const entry of history) {
    historyMap[normalizeStatus(entry.status)] = entry
  }

  return (
    <div className="w-full">
      {/* Step indicator row */}
      <div className="flex items-center w-full mb-6">
        {STAGES.map((stage, idx) => {
          const isDone    = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isPending = idx > currentIdx

          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isDone    ? `${stage.activeBg} border-transparent`    : ''}
                    ${isCurrent ? `${stage.bg} ${stage.border} ring-4 ring-offset-1 ring-${stage.dot.replace('bg-', '')}` : ''}
                    ${isPending ? 'bg-gray-100 border-gray-300'             : ''}
                  `}
                >
                  {isDone    && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {isCurrent && stage.key === 'Pending'    && <Clock    className={`w-5 h-5 ${stage.color}`} />}
                  {isCurrent && stage.key === 'In Process' && <Loader2  className={`w-5 h-5 ${stage.color} animate-spin`} />}
                  {isCurrent && stage.key === 'Completed'  && <CheckCircle2 className={`w-5 h-5 ${stage.color}`} />}
                  {isPending && <Circle className="w-4 h-4 text-gray-400" />}
                </div>
                <span className={`mt-2 text-xs font-semibold whitespace-nowrap
                  ${isDone    ? stage.color   : ''}
                  ${isCurrent ? stage.color   : ''}
                  ${isPending ? 'text-gray-400' : ''}
                `}>
                  {stage.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {idx < STAGES.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all
                  ${idx < currentIdx ? stage.connectorActive : 'bg-gray-200'}
                `} />
              )}
            </div>
          )
        })}
      </div>

      {/* Vertical timeline of history entries */}
      <div className="space-y-0">
        {/* Always show submission as first entry */}
        <TimelineRow
          label="Complaint Submitted"
          timestamp={submittedAt}
          remarks=""
          by=""
          stageIdx={0}
          isFirst
          isDone={currentIdx >= 0}
          dotColor="bg-yellow-400"
          lineColor="bg-gray-200"
          isLast={history.length === 0 && currentIdx === 0}
        />

        {STAGES.map((stage, idx) => {
          const entry = historyMap[stage.key]
          if (!entry) return null
          const isLast = idx === currentIdx && Object.keys(historyMap).filter((k) => stageIndex(k) > idx).length === 0
          return (
            <TimelineRow
              key={stage.key}
              label={`Status → ${stage.label}`}
              timestamp={entry.timestamp}
              remarks={entry.remarks}
              by={entry.changed_by}
              stageIdx={idx}
              isDone={idx <= currentIdx}
              dotColor={stage.dot}
              lineColor={idx < currentIdx ? stage.connectorActive : 'bg-gray-200'}
              isLast={isLast}
            />
          )
        })}
      </div>
    </div>
  )
}

function TimelineRow({
  label, timestamp, remarks, by, isDone, dotColor, lineColor, isLast, isFirst,
}: {
  label: string
  timestamp?: string
  remarks: string
  by: string
  stageIdx: number
  isDone: boolean
  dotColor: string
  lineColor: string
  isLast?: boolean
  isFirst?: boolean
}) {
  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${isDone ? dotColor : 'bg-gray-300'}`} />
        {!isLast && <div className={`w-0.5 flex-1 min-h-[2rem] mt-1 ${lineColor}`} />}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1">
        <p className={`text-sm font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
        {timestamp && (
          <p className="text-xs text-gray-500 mt-0.5">{timestamp}{by ? ` · by ${by}` : ''}</p>
        )}
        {remarks && (
          <p className="text-xs text-gray-600 mt-1 italic bg-gray-50 rounded px-2 py-1 border border-gray-100">
            "{remarks}"
          </p>
        )}
      </div>
    </div>
  )
}
