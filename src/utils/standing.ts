import type { Standing } from '@/types/models'

const DEMERITS_PER_PENALTY = 3
const PENALTIES_FOR_WARNING = 3
const PENALTIES_FOR_TERMINATION = 5

export interface StandingResult {
  netDemerits: number
  penalties: number
  standing: Standing
  message: string | null
}

/**
 * Merits offset demerits before penalties are derived — this is the one
 * source of truth for the rule, called both when an officer posts a
 * merit/demerit change and when a dashboard needs to display a preview.
 */
export function computeStanding(merits: number, demerits: number): StandingResult {
  const netDemerits = Math.max(0, demerits - merits)
  const penalties = Math.floor(netDemerits / DEMERITS_PER_PENALTY)

  let standing: Standing = 'good'
  let message: string | null = null

  if (penalties >= PENALTIES_FOR_TERMINATION) {
    standing = 'termination'
    message = `${penalties} penalties reached — residency termination alert. Management review required.`
  } else if (penalties >= PENALTIES_FOR_WARNING) {
    standing = 'warning'
    message = `${penalties} penalties reached — mandatory Management counseling warning.`
  }

  return { netDemerits, penalties, standing, message }
}
