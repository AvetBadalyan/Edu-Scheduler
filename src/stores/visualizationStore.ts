/**
 * VisualizationStore — manages algorithm visualization playback state.
 *
 * Drives the step-by-step animated display of the scheduling algorithm.
 * Playback states: idle → playing → paused → complete
 *
 * Requirements: 4.1–4.8
 */
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type {
  AlgorithmStep,
  DecisionLogEntry,
  HighlightedElement,
  PlaybackState,
  ScheduleInput,
  ScheduleResult,
} from "@/types"
import { collectSteps } from "@/lib/algorithm/schedulingAlgorithm"

// ─── VisualizationStore interface ────────────────────────────────────────────

interface VisualizationStore {
  // State
  steps: AlgorithmStep[]
  currentStepIndex: number
  playbackState: PlaybackState
  playbackSpeed: number // multiplier: 0.5 | 1 | 2 | 4
  highlightedElements: HighlightedElement[]
  decisionLog: DecisionLogEntry[]
  result: ScheduleResult | null
  isLoading: boolean

  // Actions
  startVisualization: (input: ScheduleInput) => void
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  setSpeed: (speed: number) => void
  jumpToStep: (index: number) => void
  reset: () => void

  // Internal
  _playIntervalId: ReturnType<typeof setInterval> | null
  _tickPlayback: () => void
}

// ─── Helper: extract highlighted elements from a step ────────────────────────

function extractHighlights(step: AlgorithmStep): HighlightedElement[] {
  const elements: HighlightedElement[] = []

  if (step.currentLecturer) {
    elements.push({
      type: "lecturer",
      id: step.currentLecturer,
      style: step.type === "conflict" ? "conflict" : step.type === "assign" ? "success" : "active",
    })
  }
  if (step.currentRoom) {
    elements.push({
      type: "room",
      id: step.currentRoom,
      style: step.type === "conflict" ? "conflict" : step.type === "assign" ? "success" : "active",
    })
  }
  if (step.currentFaculty) {
    elements.push({
      type: "faculty",
      id: step.currentFaculty,
      style: "active",
    })
  }
  if (step.currentSlot) {
    elements.push({
      type: "slot",
      id: `${step.currentSlot.day}-${step.currentSlot.hour}`,
      slot: step.currentSlot,
      style: step.type === "conflict" ? "conflict" : step.type === "assign" ? "success" : "active",
    })
  }

  return elements
}

// ─── Store implementation ────────────────────────────────────────────────────

const BASE_INTERVAL_MS = 800

export const useVisualizationStore = create<VisualizationStore>()(
  devtools(
    (set, get) => ({
      steps: [],
      currentStepIndex: -1,
      playbackState: "idle",
      playbackSpeed: 1,
      highlightedElements: [],
      decisionLog: [],
      result: null,
      isLoading: false,
      _playIntervalId: null,

      // ── startVisualization ─────────────────────────────────────────────────

      startVisualization: (input) => {
        set({ isLoading: true })
        // Run synchronously (the algorithm is fast enough for typical inputs)
        const { steps, result } = collectSteps(input)

        const log: DecisionLogEntry[] = steps.map((s) => ({
          stepNumber: s.stepNumber,
          description: s.description,
          type: s.type,
        }))

        set({
          steps,
          result,
          decisionLog: log,
          currentStepIndex: -1,
          playbackState: "idle",
          highlightedElements: [],
          isLoading: false,
        })
      },

      // ── play ───────────────────────────────────────────────────────────────

      play: () => {
        const { steps, currentStepIndex, playbackState } = get()
        if (playbackState === "complete" || steps.length === 0) return

        const startIndex = currentStepIndex === steps.length - 1 ? 0 : currentStepIndex

        set({ playbackState: "playing", currentStepIndex: startIndex })

        const id = setInterval(() => {
          get()._tickPlayback()
        }, BASE_INTERVAL_MS / get().playbackSpeed)

        set({ _playIntervalId: id })
      },

      // ── pause ──────────────────────────────────────────────────────────────

      pause: () => {
        const { _playIntervalId } = get()
        if (_playIntervalId) {
          clearInterval(_playIntervalId)
          set({ _playIntervalId: null })
        }
        set({ playbackState: "paused" })
      },

      // ── stepForward ────────────────────────────────────────────────────────

      stepForward: () => {
        const { steps, currentStepIndex } = get()
        if (currentStepIndex >= steps.length - 1) return

        const nextIndex = currentStepIndex + 1
        const step = steps[nextIndex]

        set({
          currentStepIndex: nextIndex,
          highlightedElements: extractHighlights(step),
          playbackState: nextIndex === steps.length - 1 ? "complete" : "paused",
        })
      },

      // ── stepBackward ───────────────────────────────────────────────────────

      stepBackward: () => {
        const { currentStepIndex, steps } = get()
        if (currentStepIndex <= 0) return

        const prevIndex = currentStepIndex - 1
        const step = steps[prevIndex]

        set({
          currentStepIndex: prevIndex,
          highlightedElements: extractHighlights(step),
          playbackState: "paused",
        })
      },

      // ── setSpeed ───────────────────────────────────────────────────────────

      setSpeed: (speed) => {
        const { playbackState, _playIntervalId } = get()
        set({ playbackSpeed: speed })

        // Restart interval if currently playing
        if (playbackState === "playing") {
          if (_playIntervalId) clearInterval(_playIntervalId)
          const id = setInterval(() => get()._tickPlayback(), BASE_INTERVAL_MS / speed)
          set({ _playIntervalId: id })
        }
      },

      // ── jumpToStep ─────────────────────────────────────────────────────────

      jumpToStep: (index) => {
        const { steps, _playIntervalId } = get()
        if (index < 0 || index >= steps.length) return

        if (_playIntervalId) {
          clearInterval(_playIntervalId)
          set({ _playIntervalId: null })
        }

        const step = steps[index]
        set({
          currentStepIndex: index,
          highlightedElements: extractHighlights(step),
          playbackState: index === steps.length - 1 ? "complete" : "paused",
        })
      },

      // ── reset ──────────────────────────────────────────────────────────────

      reset: () => {
        const { _playIntervalId } = get()
        if (_playIntervalId) clearInterval(_playIntervalId)
        set({
          steps: [],
          currentStepIndex: -1,
          playbackState: "idle",
          highlightedElements: [],
          decisionLog: [],
          result: null,
          isLoading: false,
          _playIntervalId: null,
        })
      },

      // ── _tickPlayback ──────────────────────────────────────────────────────

      _tickPlayback: () => {
        const { steps, currentStepIndex, _playIntervalId } = get()
        const nextIndex = currentStepIndex + 1

        if (nextIndex >= steps.length) {
          if (_playIntervalId) clearInterval(_playIntervalId)
          set({ playbackState: "complete", _playIntervalId: null })
          return
        }

        const step = steps[nextIndex]
        set({
          currentStepIndex: nextIndex,
          highlightedElements: extractHighlights(step),
        })
      },
    }),
    { name: "VisualizationStore" }
  )
)
