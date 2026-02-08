// src/audio/hooks/useWaveform.ts
'use client'

import { useState, useEffect, useRef } from 'react'

interface UseWaveformOptions {
  audioUrl?: string
  peaks?: number            // Number of data points (default 128)
}

interface UseWaveformReturn {
  waveformData: number[] | null   // Array of 0-1 peak values
  isGenerating: boolean
  error: string | null
}

/**
 * useWaveform - Generate waveform data from audio buffer client-side
 *
 * Extracts peak values from audio buffer for waveform visualization.
 * Results can be cached in card content to avoid re-generation.
 */
export function useWaveform(options: UseWaveformOptions): UseWaveformReturn {
  const { audioUrl, peaks = 128 } = options

  const [waveformData, setWaveformData] = useState<number[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache to avoid re-generating for same URL
  const cacheRef = useRef<Map<string, number[]>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!audioUrl) {
      setWaveformData(null)
      setError(null)
      return
    }

    // Check cache first
    const cached = cacheRef.current.get(audioUrl)
    if (cached) {
      setWaveformData(cached)
      setError(null)
      return
    }

    // Generate waveform data
    const generateWaveform = async () => {
      setIsGenerating(true)
      setError(null)

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        // Fetch audio file
        const response = await fetch(audioUrl, { signal })
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // Create AudioContext for decoding
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        // Close AudioContext (we only needed it for decoding)
        audioContext.close()

        // Extract peaks from buffer
        const channelData = audioBuffer.getChannelData(0) // Use first channel (mono or left)
        const samplesPerPeak = Math.floor(channelData.length / peaks)
        const peakData: number[] = []

        for (let i = 0; i < peaks; i++) {
          const start = i * samplesPerPeak
          const end = Math.min(start + samplesPerPeak, channelData.length)

          // Find maximum absolute value in this segment
          let maxPeak = 0
          for (let j = start; j < end; j++) {
            const sample = Math.abs(channelData[j])
            if (sample > maxPeak) {
              maxPeak = sample
            }
          }

          peakData.push(maxPeak)
        }

        // Normalize peaks to 0-1 range
        const maxValue = Math.max(...peakData, 0.0001) // Avoid division by zero
        const normalizedPeaks = peakData.map(peak => peak / maxValue)

        // Cache the result
        cacheRef.current.set(audioUrl, normalizedPeaks)

        // Update state
        if (!signal.aborted) {
          setWaveformData(normalizedPeaks)
          setIsGenerating(false)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Failed to generate waveform:', errorMessage)

        if (!signal.aborted) {
          setError(errorMessage)
          setWaveformData(null)
          setIsGenerating(false)
        }
      }
    }

    generateWaveform()

    // Cleanup: abort fetch if component unmounts or URL changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [audioUrl, peaks])

  return {
    waveformData,
    isGenerating,
    error
  }
}
