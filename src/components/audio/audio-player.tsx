'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Settings } from 'lucide-react'
import type { AudioTrack, AudioCardContent, ReverbConfig } from '@/types/audio'
import { useAudioPlayer } from '@/audio/hooks/useAudioPlayer'
import { PlayerControls } from './player-controls'
import { WaveformDisplay } from './waveform-display'
import { VarispeedSlider } from './varispeed-slider'
import { ReverbKnob } from './reverb-knob'
import { ReverbConfigModal } from './reverb-config-modal'
import { TrackList } from './track-list'
import { cn } from '@/lib/utils'
import { trackAudioPlay } from '@/lib/analytics/track-event'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'macintosh' | 'system-settings' | 'blinkies' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

// Halftone dot pattern — staggered grid matching the Macintosh calculator style
// Two offset radial-gradient layers create a hex-like dot arrangement
function poolsuiteHalftone(color: string) {
  const dot = `radial-gradient(circle, ${color} 0.9px, transparent 0.9px)`
  return {
    background: [
      `${dot} 0 0 / 4px 5.5px`,
      `${dot} 2px 2.75px / 4px 5.5px`,
    ].join(', '),
  }
}

// Touch-friendly speed slider — converts touch X position to 0.5-1.5 range
function useSpeedSliderTouch(
  trackRef: React.RefObject<HTMLDivElement | null>,
  onSpeedChange: (speed: number) => void
) {
  const dragging = useRef(false)

  const calcSpeed = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const speed = Math.round((0.5 + ratio * 1.0) * 100) / 100
    onSpeedChange(speed)
  }, [trackRef, onSpeedChange])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true
    calcSpeed(e.touches[0].clientX)
  }, [calcSpeed])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return
    e.preventDefault()
    calcSpeed(e.touches[0].clientX)
  }, [calcSpeed])

  const onTouchEnd = useCallback(() => {
    dragging.current = false
  }, [])

  return { onTouchStart, onTouchMove, onTouchEnd }
}

function formatPoolsuiteTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

interface AudioPlayerProps {
  tracks: AudioTrack[]
  albumArtUrl?: string
  showWaveform?: boolean
  looping?: boolean
  autoplay?: boolean
  transparentBackground?: boolean
  reverbConfig?: ReverbConfig
  playerColors?: AudioCardContent['playerColors']
  blinkieColors?: AudioCardContent['blinkieColors']
  blinkieCardHasBgImage?: boolean
  cardId: string
  pageId: string
  isEditing?: boolean         // In editor = show reverb config button
  onContentChange?: (updates: Record<string, unknown>) => void  // For editor updates
  themeVariant?: ThemeVariant
  className?: string
}

export function AudioPlayer({
  tracks,
  albumArtUrl,
  showWaveform = true,
  looping = false,
  autoplay = false,
  transparentBackground = false,
  reverbConfig,
  playerColors,
  blinkieColors,
  blinkieCardHasBgImage = false,
  cardId,
  pageId,
  isEditing = false,
  onContentChange,
  themeVariant = 'instagram-reels',
  className = ''
}: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const placeholderTrack: AudioTrack = {
    id: 'placeholder',
    title: 'TRACK TITLE',
    artist: 'ARTIST NAME',
    duration: 210,
    audioUrl: '',
    storagePath: '',
  }
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : placeholderTrack
  const isPlaceholder = tracks.length === 0 || !currentTrack.audioUrl
  const currentTrackUrl = currentTrack.audioUrl || undefined

  // Use the audio player hook (must be called before any early returns)
  const player = useAudioPlayer({
    cardId,
    trackUrl: currentTrackUrl,
    looping,
    autoplay,
    reverbConfig,
    onEnded: () => {
      // Auto-advance to next track if multi-track and not looping
      if (!looping && tracks.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % tracks.length
        setCurrentTrackIndex(nextIndex)
      }
    }
  })

  // Marquee overflow detection for Macintosh theme
  const marqueeContainerRef = useRef<HTMLDivElement>(null)
  const marqueeTextRef = useRef<HTMLSpanElement>(null)
  const [isMarqueeNeeded, setIsMarqueeNeeded] = useState(false)

  // Touch-friendly varispeed slider refs
  const varispeedTrackRef = useRef<HTMLDivElement>(null)
  const speedTouch = useSpeedSliderTouch(varispeedTrackRef, player.setSpeed)

  useEffect(() => {
    if (!marqueeContainerRef.current || !marqueeTextRef.current) return
    const container = marqueeContainerRef.current
    const text = marqueeTextRef.current
    setIsMarqueeNeeded(text.scrollWidth > container.clientWidth)
  }, [currentTrackIndex])

  if (tracks.length === 0 && !isEditing) {
    return null
  }

  // Handle track switching
  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index)
  }

  // Handle reverb config changes in editor
  const handleReverbConfigChange = (newConfig: ReverbConfig) => {
    if (onContentChange) {
      onContentChange({ reverbConfig: newConfig })
    }
  }

  // Handle play with analytics tracking
  const handlePlay = () => {
    // Track audio play on public pages only (not in editor)
    if (!isEditing && !player.isPlaying && pageId) {
      trackAudioPlay({
        cardId,
        pageId,
        trackTitle: currentTrack?.title,
        duration: currentTrack?.duration
      })
    }
    // Toggle playback
    player.togglePlay()
  }

  // Get waveform data from current track
  const waveformData = currentTrack?.waveformData

  // Theme booleans
  const isReceipt = themeVariant === 'receipt'
  const isVcr = themeVariant === 'vcr-menu'
  const isClassified = themeVariant === 'classified'
  const isBlinkies = themeVariant === 'blinkies'
  const isMacOs = themeVariant === 'mac-os'
  const isMacintosh = themeVariant === 'macintosh'
  const isIpodClassic = themeVariant === 'ipod-classic'
  const isPoolsuite = themeVariant === 'system-settings' || isBlinkies || isMacOs || themeVariant === 'instagram-reels'
  const isCompact = isReceipt || isVcr || isClassified || isPoolsuite || isMacintosh || isIpodClassic

  // Color overrides per theme
  // VCR: follow theme text color (var(--theme-text)); receipt: force black; classified/system-settings: theme text
  const effectiveForegroundColor = isReceipt ? '#1a1a1a' : isMacintosh ? '#000' : isIpodClassic ? 'var(--theme-text, #3d3c39)' : (isVcr || isClassified) ? 'var(--theme-text)' : playerColors?.foregroundColor
  const effectiveElementBgColor = transparentBackground ? 'transparent' : (isReceipt || isVcr || isClassified || isMacintosh || isIpodClassic) ? 'transparent' : playerColors?.elementBgColor

  // ─── VCR THEME: fully bordered OSD layout ───
  if (isVcr) {
    const vcrColor = effectiveForegroundColor
    const vcrFont: React.CSSProperties = { fontFamily: 'var(--font-pixter-granular), monospace', color: vcrColor }
    const vcrBorder = '1px solid currentColor'

    return (
      <div
        className={cn('flex flex-col', className)}
        style={{ ...vcrFont, border: vcrBorder }}
      >
        {/* ▶ PLAY / ❚❚ PAUSE — clickable header */}
        <button
          onClick={handlePlay}
          disabled={!player.isLoaded && !player.isLoading}
          className="flex items-center justify-between px-3 py-2 text-left uppercase tracking-wider cursor-pointer hover:opacity-80"
          style={{
            borderBottom: vcrBorder,
            opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
          }}
        >
          <span className="text-sm font-bold">
            {player.isPlaying ? '▶ PLAY' : '❚❚ PAUSE'}
          </span>
          <span className="text-xs opacity-70">
            TR.{String(currentTrackIndex + 1).padStart(2, '0')}
          </span>
        </button>

        {/* Track info */}
        {currentTrack && (
          <div className="px-3 py-2 uppercase tracking-wider" style={{ borderBottom: vcrBorder }}>
            <div className="text-sm font-bold truncate">
              TR.{String(currentTrackIndex + 1).padStart(2, '0')} {currentTrack.title}
            </div>
            <div className="text-xs opacity-50 truncate">
              {currentTrack.artist && `${currentTrack.artist} · `}
              {Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="px-3 py-2" style={{ borderBottom: vcrBorder }}>
          <WaveformDisplay
            showWaveform={showWaveform}
            waveformData={waveformData}
            progress={player.progress}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seek}
            foregroundColor={vcrColor}
            elementBgColor="transparent"
            themeVariant={themeVariant}
            isPlaying={player.isPlaying}
          />
        </div>

        {/* Controls: varispeed + bordered reverb box */}
        <div data-no-drag className="flex items-stretch gap-0 px-3 py-2">
          <div className="flex-1 min-w-0 pr-3">
            <VarispeedSlider
              speed={player.speed}
              mode={player.varispeedMode}
              onSpeedChange={player.setSpeed}
              onModeChange={player.setVarispeedMode}
              foregroundColor={vcrColor}
              elementBgColor="transparent"
              themeVariant={themeVariant}
              hideModeToggle
            />
          </div>
          {/* Bordered box: mode toggle + reverb knob */}
          <div
            className="flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1"
            style={{ border: vcrBorder }}
          >
            <button
              onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
              className="px-2 py-0.5 text-[10px] rounded-none border transition-colors uppercase tracking-wider w-full text-center"
              style={{ color: 'inherit', borderColor: 'currentColor', backgroundColor: 'transparent' }}
            >
              {player.varispeedMode === 'timestretch' ? 'TIME-STRETCH' : 'NATURAL'}
            </button>
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={vcrColor}
              elementBgColor="transparent"
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 rounded-none transition-colors"
                    style={{ color: 'inherit' }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Track List (multi-track only) */}
        {tracks.length > 1 && (
          <div style={{ borderTop: vcrBorder }}>
            <TrackList
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              foregroundColor={vcrColor}
              elementBgColor="transparent"
              themeVariant={themeVariant}
            />
          </div>
        )}
      </div>
    )
  }

  // ─── CLASSIFIED THEME: VCR-style bordered layout with classified fonts ───
  if (isClassified) {
    const clColor = 'var(--theme-text)'
    const clFont: React.CSSProperties = { fontFamily: 'var(--font-special-elite), monospace', color: clColor }
    const clBorder = '1px solid currentColor'

    return (
      <>
        <div className="classified-divider">{'-'.repeat(80)}</div>
        <div className="text-center py-2 text-sm uppercase tracking-widest" style={{ color: 'var(--theme-accent)', fontFamily: 'var(--font-special-elite)' }}>
          // AUDIO TRANSMISSION //
        </div>
        <div className="classified-divider">{'-'.repeat(80)}</div>

        <div
          className={cn('flex flex-col', className)}
          style={{ ...clFont, border: clBorder }}
        >
          {/* PLAY / PAUSE — clickable header */}
          <button
            onClick={handlePlay}
            disabled={!player.isLoaded && !player.isLoading}
            className="flex items-center justify-between px-3 py-2 text-left uppercase tracking-wider cursor-pointer hover:opacity-80"
            style={{
              borderBottom: clBorder,
              opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
            }}
          >
            <span className="text-sm font-bold">
              {player.isPlaying ? '> PLAY' : '|| PAUSE'}
            </span>
          </button>

          {/* Track info */}
          {currentTrack && (
            <div className="px-3 py-2 uppercase tracking-wider" style={{ borderBottom: clBorder }}>
              <div className="text-sm font-bold truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs opacity-50 truncate">
                {currentTrack.artist && `${currentTrack.artist} · `}
                {Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="px-3 py-2" style={{ borderBottom: clBorder }}>
            <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60">Progress</div>
            <WaveformDisplay
              showWaveform={showWaveform}
              waveformData={waveformData}
              progress={player.progress}
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.seek}
              foregroundColor={clColor}
              elementBgColor="transparent"
              themeVariant={themeVariant}
              isPlaying={player.isPlaying}
            />
          </div>

          {/* Controls: varispeed + bordered reverb box */}
          <div data-no-drag className="flex items-stretch gap-0 px-3 py-2">
            <div className="flex-1 min-w-0 pr-3">
              <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60">Varispeed</div>
              <VarispeedSlider
                speed={player.speed}
                mode={player.varispeedMode}
                onSpeedChange={player.setSpeed}
                onModeChange={player.setVarispeedMode}
                foregroundColor={clColor}
                elementBgColor="transparent"
                themeVariant={themeVariant}
                hideModeToggle
              />
            </div>
            {/* Bordered box: mode toggle + reverb knob */}
            <div
              className="flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1"
              style={{ border: clBorder }}
            >
              <button
                onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
                className="px-2 py-0.5 text-[10px] rounded-none border transition-colors uppercase tracking-wider w-full text-center"
                style={{ color: 'inherit', borderColor: 'currentColor', backgroundColor: 'transparent' }}
              >
                {player.varispeedMode === 'timestretch' ? 'TIME-STRETCH' : 'NATURAL'}
              </button>
              <ReverbKnob
                mix={player.reverbMix}
                onMixChange={player.setReverbMix}
                foregroundColor={clColor}
                elementBgColor="transparent"
                themeVariant={themeVariant}
              />
              {isEditing && reverbConfig && (
                <ReverbConfigModal
                  config={reverbConfig}
                  onSave={handleReverbConfigChange}
                  trigger={
                    <button
                      className="p-1 rounded-none transition-colors"
                      style={{ color: 'inherit' }}
                      aria-label="Configure reverb"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  }
                />
              )}
            </div>
          </div>

          {/* Track List (multi-track only) */}
          {tracks.length > 1 && (
            <div style={{ borderTop: clBorder }}>
              <TrackList
                tracks={tracks}
                currentTrackIndex={currentTrackIndex}
                onTrackSelect={handleTrackSelect}
                foregroundColor={clColor}
                elementBgColor="transparent"
                themeVariant={themeVariant}
              />
            </div>
          )}
        </div>

        <div className="classified-divider">{'-'.repeat(80)}</div>
      </>
    )
  }

  // ─── MACINTOSH THEME: VCR-style bordered layout with 8-bit pixel aesthetic ───
  if (isMacintosh) {
    const macBg = playerColors?.elementBgColor || '#fff'
    const macBorder = playerColors?.borderColor || '#000'
    const macChecker = playerColors?.foregroundColor || '#000'
    const macFont: React.CSSProperties = {
      fontFamily: "var(--font-pix-chicago), 'Chicago', monospace",
      color: macBorder
    }
    // 8-bit pixel border clip-path for boxes
    const macPixelClip = `polygon(
      6px 0%, calc(100% - 6px) 0%,
      calc(100% - 6px) 3px, calc(100% - 3px) 3px,
      calc(100% - 3px) 6px, 100% 6px,
      100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px),
      calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px),
      calc(100% - 6px) 100%, 6px 100%,
      6px calc(100% - 3px), 3px calc(100% - 3px),
      3px calc(100% - 6px), 0% calc(100% - 6px),
      0% 6px, 3px 6px,
      3px 3px, 6px 3px
    )`
    // Helper: bordered shell with interior for 8-bit bordered boxes
    const MacBox = ({ children, className: cls, style: s }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
      <div style={{ background: macBorder, clipPath: macPixelClip, padding: '2px' }}>
        <div className={cls} style={{ background: macBg, clipPath: macPixelClip, ...s }}>
          {children}
        </div>
      </div>
    )

    // Build marquee text for track title
    const trackTitle = currentTrack
      ? `${currentTrack.title}${currentTrack.artist ? ` — ${currentTrack.artist}` : ''}`
      : ''

    return (
      <div
        className={cn('flex flex-col gap-1.5 p-2', className)}
        style={{ ...macFont, background: transparentBackground ? 'transparent' : macBg }}
      >
        {/* ── Row 1: PLAY button (left) + Track info (right, ~3/4 width) ── */}
        <div className="flex items-stretch gap-1.5">
          <button
            onClick={handlePlay}
            disabled={!player.isLoaded && !player.isLoading}
            className="uppercase tracking-wider cursor-pointer hover:opacity-80 flex-shrink-0"
            style={{
              opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
            }}
          >
            <div style={{ background: macBorder, clipPath: macPixelClip, padding: '2px', display: 'inline-block', height: '100%' }}>
              <div className="flex items-center h-full" style={{ background: macBg, clipPath: macPixelClip, padding: '0 12px' }}>
                <span className="text-[11px] font-bold whitespace-nowrap">
                  {player.isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </div>
            </div>
          </button>
          {currentTrack ? (
            <div className="flex-1 min-w-0">
              <MacBox className="px-2 py-0.5 uppercase tracking-wider overflow-hidden flex items-center" style={{ height: '24px' }}>
                <div ref={marqueeContainerRef} className="whitespace-nowrap text-[10px] font-bold overflow-hidden">
                  <span ref={marqueeTextRef} className={isMarqueeNeeded ? 'mac-audio-marquee inline-block' : 'inline-block'}>{trackTitle}</span>
                </div>
              </MacBox>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* ── Progress bar — full width, checkers fill ── */}
        <div className="px-1">
          <WaveformDisplay
            showWaveform={showWaveform}
            waveformData={waveformData}
            progress={player.progress}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seek}
            foregroundColor={macBorder}
            elementBgColor="transparent"
            themeVariant="macintosh"
            isPlaying={player.isPlaying}
            macCheckerColor={macChecker}
            macBgColor={macBg}
          />
        </div>

        {/* ── Varispeed slider ── */}
        <div data-no-drag className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0 px-1">
            {/* Checkerboard slider with 8-bit rectangle knob */}
            <div className="relative" style={{ height: '28px' }}>
              {/* Checkerboard bar — centered vertically, subtle 8-bit corners */}
              {(() => {
                const barClip = `polygon(
                  2px 0, calc(100% - 2px) 0,
                  calc(100% - 2px) 1px, calc(100% - 1px) 1px,
                  calc(100% - 1px) 2px, 100% 2px,
                  100% calc(100% - 2px), calc(100% - 1px) calc(100% - 2px),
                  calc(100% - 1px) calc(100% - 1px), calc(100% - 2px) calc(100% - 1px),
                  calc(100% - 2px) 100%, 2px 100%,
                  2px calc(100% - 1px), 1px calc(100% - 1px),
                  1px calc(100% - 2px), 0 calc(100% - 2px),
                  0 2px, 1px 2px,
                  1px 1px, 2px 1px
                )`
                return (
                  <div className="absolute inset-x-0" style={{ top: '6px', bottom: '6px' }}>
                    <div className="w-full h-full" style={{ background: macBorder, clipPath: barClip, padding: '2px' }}>
                      <div
                        className="w-full h-full"
                        style={{
                          clipPath: barClip,
                          background: `repeating-conic-gradient(${macChecker} 0% 25%, ${macBg} 0% 50%) 0 0 / 4px 4px`,
                        }}
                      />
                    </div>
                  </div>
                )
              })()}
              {/* Rectangle knob */}
              {(() => {
                const knobClip = `polygon(
                  3px 0, calc(100% - 3px) 0,
                  calc(100% - 3px) 1px, calc(100% - 2px) 1px,
                  calc(100% - 2px) 2px, calc(100% - 1px) 2px,
                  calc(100% - 1px) 3px, 100% 3px,
                  100% calc(100% - 3px), calc(100% - 1px) calc(100% - 3px),
                  calc(100% - 1px) calc(100% - 2px), calc(100% - 2px) calc(100% - 2px),
                  calc(100% - 2px) calc(100% - 1px), calc(100% - 3px) calc(100% - 1px),
                  calc(100% - 3px) 100%, 3px 100%,
                  3px calc(100% - 1px), 2px calc(100% - 1px),
                  2px calc(100% - 2px), 1px calc(100% - 2px),
                  1px calc(100% - 3px), 0 calc(100% - 3px),
                  0 3px, 1px 3px,
                  1px 2px, 2px 2px,
                  2px 1px, 3px 1px
                )`
                return (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${((player.speed - 0.5) / 1.0) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '16px',
                      marginLeft: '-8px',
                    }}
                  >
                    <div className="w-full h-full" style={{ background: macBorder, clipPath: knobClip, padding: '2px' }}>
                      <div
                        className="w-full h-full flex items-center justify-center gap-[4px]"
                        style={{ background: macBg, clipPath: knobClip }}
                      >
                        <div style={{ width: '1px', height: '100%', background: macBorder }} />
                        <div style={{ width: '1px', height: '100%', background: macBorder }} />
                      </div>
                    </div>
                  </div>
                )
              })()}
              {/* Hidden range input */}
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={player.speed}
                onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full cursor-pointer z-20"
                style={{ opacity: 0 }}
                aria-label="Varispeed"
              />
            </div>
            {/* Speed + mode below slider */}
            <div className="flex items-center gap-1.5 mt-1">
              <MacBox className="py-0.5 flex items-center justify-center" style={{ width: '52px' }}>
                <span className="text-[10px] font-bold font-mono">{player.speed.toFixed(2)}x</span>
              </MacBox>
              <MacBox className="px-2 py-0.5 flex items-center">
                <button
                  onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
                  className="text-[10px] uppercase tracking-wider font-bold"
                  style={{ color: 'inherit' }}
                >
                  {player.varispeedMode === 'timestretch' ? 'STRETCH' : 'NATURAL'}
                </button>
              </MacBox>
            </div>
          </div>

          {/* Reverb — compact, tucked right */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ transform: 'scale(0.7)', transformOrigin: 'top right', marginBottom: '-8px' }}>
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={macBorder}
              elementBgColor="transparent"
              themeVariant="macintosh"
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 rounded-none transition-colors"
                    style={{ color: 'inherit' }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* ── Box 6: Track List (multi-track only) ── */}
        {tracks.length > 1 && (
          <MacBox>
            <TrackList
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              foregroundColor={macBorder}
              elementBgColor="transparent"
              themeVariant="macintosh"
            />
          </MacBox>
        )}

        {/* Marquee CSS animation — only applied when text overflows */}
        <style>{`
          .mac-audio-marquee {
            animation: macMarquee 18s linear infinite;
          }
          @keyframes macMarquee {
            0%, 10% { transform: translateX(0); }
            45%, 55% { transform: translateX(calc(-100% + ${marqueeContainerRef.current?.clientWidth ?? 200}px)); }
            90%, 100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    )
  }

  // ─── POOLSUITE FM THEME (System Settings, Blinkies, Mac OS, Instagram Reels) ───
  if (isPoolsuite) {
    // Colors: use custom blinkieColors if set, otherwise follow theme palette
    const psColor = blinkieColors?.text || 'var(--theme-text, #000000)'
    const psFont: React.CSSProperties = {
      fontFamily: 'var(--font-chikarego), var(--font-ishmeria), monospace',
      color: psColor,
    }
    // All borders are black, thin, rounded — the Poolsuite way
    const psBorder = `1px solid ${psColor}`
    const psRadius = '4px'
    // Button bg — custom blinkieColors.buttons if set, otherwise theme card bg
    const btnBg = blinkieCardHasBgImage ? 'transparent' : blinkieColors?.buttons || (transparentBackground ? 'transparent' : 'var(--theme-card-bg, #F9F0E9)')
    // Player box bg override (affects inner boxes)
    const playerBoxBg = blinkieCardHasBgImage ? undefined : blinkieColors?.playerBox || undefined
    // Shared inner box style — little rounded bordered boxes inside the card
    const psBox: React.CSSProperties = {
      border: psBorder,
      borderRadius: psRadius,
      ...(playerBoxBg ? { backgroundColor: playerBoxBg } : {}),
    }

    // Progress bar position
    const progressPercent = player.progress * 100
    // Varispeed slider position for halftone fill
    const varispeedPercent = ((player.speed - 0.5) / (1.5 - 0.5)) * 100

    return (
      <div
        className={cn('poolsuite-player flex flex-col gap-2 p-2.5', className)}
        style={psFont}
      >
        {/* ── Box 1: Track Info + Time + Transport ── */}
        <div className="px-3 py-2" style={psBox}>
          {/* Title + time row — wraps so time goes below on long titles */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
            {currentTrack && (
              <div className="text-sm font-bold" style={{ color: psColor }}>
                {currentTrack.title}
                {currentTrack.artist && (
                  <span className="font-normal opacity-50"> — {currentTrack.artist}</span>
                )}
              </div>
            )}
            <div className="text-sm font-bold tabular-nums ml-auto" style={{ color: psColor, opacity: 0.5 }}>
              {formatPoolsuiteTime(player.currentTime)}
            </div>
          </div>

          {/* Transport buttons row */}
          <div className="flex items-center gap-2">
          <div
            className="flex items-stretch flex-shrink-0 w-fit"
            style={{ border: psBorder, borderRadius: psRadius, overflow: 'hidden' }}
          >
            {/* Play */}
            <button
              onClick={handlePlay}
              disabled={!currentTrack}
              className={cn(
                'poolsuite-transport-btn flex items-center justify-center w-10 h-8',
                player.isPlaying && 'poolsuite-active'
              )}
              style={{
                backgroundColor: btnBg,
                borderRight: psBorder,
                borderRadius: 0,
              }}
              aria-label="Play"
            >
              <span className="text-sm leading-none" style={{ color: psColor }}>▶</span>
            </button>

            {/* Pause */}
            <button
              onClick={handlePlay}
              disabled={!currentTrack}
              className={cn(
                'poolsuite-transport-btn flex items-center justify-center w-10 h-8',
                !player.isPlaying && player.isLoaded && 'poolsuite-active'
              )}
              style={{
                backgroundColor: btnBg,
                borderRight: psBorder,
                borderRadius: 0,
              }}
              aria-label="Pause"
            >
              <span className="text-sm leading-none font-bold" style={{ color: psColor }}>‖</span>
            </button>

            {/* Prev */}
            {tracks.length > 1 && (
              <button
                onClick={() => {
                  const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
                  handleTrackSelect(prevIndex)
                }}
                className="poolsuite-transport-btn flex items-center justify-center w-10 h-8"
                style={{
                  backgroundColor: btnBg,
                  borderRight: psBorder,
                  borderRadius: 0,
                }}
                aria-label="Previous track"
              >
                <span className="text-[10px] leading-none" style={{ color: psColor }}>◀◀</span>
              </button>
            )}

            {/* Next */}
            {tracks.length > 1 && (
              <button
                onClick={() => {
                  const nextIndex = (currentTrackIndex + 1) % tracks.length
                  handleTrackSelect(nextIndex)
                }}
                className="poolsuite-transport-btn flex items-center justify-center w-10 h-8"
                style={{
                  backgroundColor: btnBg,
                  borderRight: psBorder,
                  borderRadius: 0,
                }}
                aria-label="Next track"
              >
                <span className="text-[10px] leading-none" style={{ color: psColor }}>▶▶</span>
              </button>
            )}

            {/* Music note */}
            <button
              onClick={() => player.setReverbMix(player.reverbMix > 0 ? 0 : 0.3)}
              className={cn(
                'poolsuite-transport-btn flex items-center justify-center w-10 h-8',
                player.reverbMix > 0 && 'poolsuite-active'
              )}
              style={{
                backgroundColor: btnBg,
                borderRadius: 0,
                border: 'none',
              }}
              aria-label="Toggle reverb"
            >
              <span className="text-xs leading-none" style={{ color: psColor }}>♪</span>
            </button>
          </div>

          </div>
        </div>

        {/* ── Box 3: Progress + Varispeed + Reverb (combined) ── */}
        <div data-no-drag className="flex items-stretch gap-2">
          {/* Left: Progress + Varispeed stacked */}
          <div className="flex-1 min-w-0 px-3 py-2" style={psBox}>
            {/* Progress bar (uses WaveformDisplay for full scrub support) */}
            <WaveformDisplay
              showWaveform={showWaveform}
              waveformData={waveformData}
              progress={player.progress}
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.seek}
              foregroundColor={psColor}
              elementBgColor="transparent"
              themeVariant="vcr-menu"
              isPlaying={player.isPlaying}
            />

            {/* Varispeed: speed + mode + slider */}
            <div className="flex items-center justify-between mt-1.5 mb-1">
              <span className="text-[10px] font-bold tabular-nums" style={{ color: psColor }}>
                {player.speed.toFixed(2)}x
              </span>
              <button
                onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
                className="poolsuite-transport-btn px-1.5 py-0 text-[8px] uppercase tracking-wider"
                style={{
                  backgroundColor: btnBg,
                  color: psColor,
                  borderRadius: '3px',
                }}
              >
                {player.varispeedMode === 'timestretch' ? 'Stretch' : 'Natural'}
              </button>
            </div>

            {/* Varispeed slider — large touch zone wraps the visual track */}
            <div
              className="relative"
              style={{ touchAction: 'none', margin: '0 0 -14px 0', padding: '0 0 14px 0' }}
              onTouchStart={speedTouch.onTouchStart}
              onTouchMove={speedTouch.onTouchMove}
              onTouchEnd={speedTouch.onTouchEnd}
            >
              <div ref={varispeedTrackRef} className="relative h-5" style={{ zIndex: 0 }}>
                {/* Halftone dots — full width behind fill, stagger creates natural edge */}
                <div
                  className="absolute inset-0"
                  style={poolsuiteHalftone(psColor)}
                />
                {/* Filled portion with border — covers dots from left */}
                {varispeedPercent > 0 && (
                  <div
                    className="absolute top-0 left-0 h-full z-[1]"
                    style={{
                      width: `${varispeedPercent}%`,
                      backgroundColor: (transparentBackground || blinkieCardHasBgImage) ? psColor : btnBg,
                      border: `1px solid ${psColor}`,
                      borderRadius: '3px',
                    }}
                  />
                )}
                {/* Hidden range for mouse/keyboard accessibility */}
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.01"
                  value={player.speed}
                  onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
                  className="absolute inset-0 z-10 cursor-pointer"
                  style={{ opacity: 0 }}
                  aria-label="Varispeed"
                />
              </div>
            </div>
            {/* Tick marks below slider */}
            <div className="flex justify-between mt-0.5 px-0.5">
              {[0.5, 1.0, 1.5].map((tick) => (
                <span key={tick} className="text-[7px] tabular-nums" style={{ color: psColor, opacity: 0.3 }}>
                  {tick}x
                </span>
              ))}
            </div>
          </div>

          {/* Right: Reverb knob */}
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 px-3 py-2" style={psBox}>
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={psColor}
              elementBgColor="transparent"
              themeVariant={isBlinkies ? 'system-settings' : themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 transition-colors hover:opacity-80"
                    style={{ color: psColor }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* ── Box 5: Track List (multi-track only) ── */}
        {tracks.length > 1 && (
          <div style={psBox}>
            <TrackList
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              foregroundColor={psColor}
              elementBgColor="transparent"
              themeVariant={isBlinkies ? 'system-settings' : themeVariant}
            />
          </div>
        )}
      </div>
    )
  }

  // ─── iPOD CLASSIC THEME: Macintosh layout with iPod screen colors ───
  if (isIpodClassic) {
    const ipodBg = 'var(--theme-card-bg, #C2C1BA)'
    const ipodBorder = 'var(--theme-text, #3d3c39)'
    const ipodChecker = 'var(--theme-text, #3d3c39)'
    const ipodFont: React.CSSProperties = {
      fontFamily: "var(--font-pix-chicago), 'Chicago', monospace",
      color: ipodBorder
    }
    // 8-bit pixel border clip-path for boxes (same as Macintosh)
    const ipodPixelClip = `polygon(
      6px 0%, calc(100% - 6px) 0%,
      calc(100% - 6px) 3px, calc(100% - 3px) 3px,
      calc(100% - 3px) 6px, 100% 6px,
      100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px),
      calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px),
      calc(100% - 6px) 100%, 6px 100%,
      6px calc(100% - 3px), 3px calc(100% - 3px),
      3px calc(100% - 6px), 0% calc(100% - 6px),
      0% 6px, 3px 6px,
      3px 3px, 6px 3px
    )`
    // Helper: bordered shell with interior for 8-bit bordered boxes
    const IpodBox = ({ children, className: cls, style: s }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
      <div style={{ background: ipodBorder, clipPath: ipodPixelClip, padding: '2px' }}>
        <div className={cls} style={{ background: ipodBg, clipPath: ipodPixelClip, ...s }}>
          {children}
        </div>
      </div>
    )

    // Build marquee text for track title
    const trackTitle = currentTrack
      ? `${currentTrack.title}${currentTrack.artist ? ` — ${currentTrack.artist}` : ''}`
      : ''

    return (
      <div
        className={cn('flex flex-col gap-1.5 p-2', className)}
        style={{ ...ipodFont, background: transparentBackground ? 'transparent' : ipodBg }}
      >
        {/* ── Row 1: PLAY button (left) + Track info (right, ~3/4 width) ── */}
        <div className="flex items-stretch gap-1.5">
          <button
            onClick={handlePlay}
            disabled={!player.isLoaded && !player.isLoading}
            className="uppercase tracking-wider cursor-pointer hover:opacity-80 flex-shrink-0"
            style={{
              opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
            }}
          >
            <div style={{ background: ipodBorder, clipPath: ipodPixelClip, padding: '2px', display: 'inline-block', height: '100%' }}>
              <div className="flex items-center h-full" style={{ background: ipodBg, clipPath: ipodPixelClip, padding: '0 12px' }}>
                <span className="text-[11px] font-bold whitespace-nowrap">
                  {player.isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </div>
            </div>
          </button>
          {currentTrack ? (
            <div className="flex-1 min-w-0">
              <IpodBox className="px-2 py-0.5 uppercase tracking-wider overflow-hidden flex items-center" style={{ height: '24px' }}>
                <div ref={marqueeContainerRef} className="whitespace-nowrap text-[10px] font-bold overflow-hidden">
                  <span ref={marqueeTextRef} className={isMarqueeNeeded ? 'ipod-audio-marquee inline-block' : 'inline-block'}>{trackTitle}</span>
                </div>
              </IpodBox>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* ── Progress bar — full width, checkers fill ── */}
        <div className="px-1">
          <WaveformDisplay
            showWaveform={showWaveform}
            waveformData={waveformData}
            progress={player.progress}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seek}
            foregroundColor={ipodBorder}
            elementBgColor="transparent"
            themeVariant="mac-os"
            isPlaying={player.isPlaying}
            macCheckerColor={ipodChecker}
            macBgColor={ipodBg}
          />
        </div>

        {/* ── Varispeed slider ── */}
        <div data-no-drag className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0 px-1">
            {/* Checkerboard slider with 8-bit rectangle knob — touch zone wraps track */}
            <div
              className="relative"
              style={{ touchAction: 'none', margin: '-10px 0', padding: '10px 0' }}
              onTouchStart={speedTouch.onTouchStart}
              onTouchMove={speedTouch.onTouchMove}
              onTouchEnd={speedTouch.onTouchEnd}
            >
              <div ref={varispeedTrackRef} className="relative" style={{ height: '28px' }}>
                {/* Checkerboard bar — centered vertically, subtle 8-bit corners */}
                {(() => {
                  const barClip = `polygon(
                    2px 0, calc(100% - 2px) 0,
                    calc(100% - 2px) 1px, calc(100% - 1px) 1px,
                    calc(100% - 1px) 2px, 100% 2px,
                    100% calc(100% - 2px), calc(100% - 1px) calc(100% - 2px),
                    calc(100% - 1px) calc(100% - 1px), calc(100% - 2px) calc(100% - 1px),
                    calc(100% - 2px) 100%, 2px 100%,
                    2px calc(100% - 1px), 1px calc(100% - 1px),
                    1px calc(100% - 2px), 0 calc(100% - 2px),
                    0 2px, 1px 2px,
                    1px 1px, 2px 1px
                  )`
                  return (
                    <div className="absolute inset-x-0" style={{ top: '6px', bottom: '6px' }}>
                      <div className="w-full h-full" style={{ background: ipodBorder, clipPath: barClip, padding: '2px' }}>
                        <div
                          className="w-full h-full"
                          style={{
                            clipPath: barClip,
                            background: `repeating-conic-gradient(${ipodChecker} 0% 25%, ${ipodBg} 0% 50%) 0 0 / 4px 4px`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })()}
                {/* Rectangle knob */}
                {(() => {
                  const knobClip = `polygon(
                    3px 0, calc(100% - 3px) 0,
                    calc(100% - 3px) 1px, calc(100% - 2px) 1px,
                    calc(100% - 2px) 2px, calc(100% - 1px) 2px,
                    calc(100% - 1px) 3px, 100% 3px,
                    100% calc(100% - 3px), calc(100% - 1px) calc(100% - 3px),
                    calc(100% - 1px) calc(100% - 2px), calc(100% - 2px) calc(100% - 2px),
                    calc(100% - 2px) calc(100% - 1px), calc(100% - 3px) calc(100% - 1px),
                    calc(100% - 3px) 100%, 3px 100%,
                    3px calc(100% - 1px), 2px calc(100% - 1px),
                    2px calc(100% - 2px), 1px calc(100% - 2px),
                    1px calc(100% - 3px), 0 calc(100% - 3px),
                    0 3px, 1px 3px,
                    1px 2px, 2px 2px,
                    2px 1px, 3px 1px
                  )`
                  return (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${((player.speed - 0.5) / 1.0) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: '16px',
                        marginLeft: '-8px',
                      }}
                    >
                      <div className="w-full h-full" style={{ background: ipodBorder, clipPath: knobClip, padding: '2px' }}>
                        <div
                          className="w-full h-full flex items-center justify-center gap-[4px]"
                          style={{ background: ipodBg, clipPath: knobClip }}
                        >
                          <div style={{ width: '1px', height: '100%', background: ipodBorder }} />
                          <div style={{ width: '1px', height: '100%', background: ipodBorder }} />
                        </div>
                      </div>
                    </div>
                  )
                })()}
                {/* Hidden range for mouse/keyboard accessibility */}
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.01"
                  value={player.speed}
                  onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full cursor-pointer z-20"
                  style={{ opacity: 0 }}
                  aria-label="Varispeed"
                />
              </div>
            </div>
            {/* Speed + mode below slider */}
            <div className="flex items-center gap-1.5 mt-1">
              <IpodBox className="py-0.5 flex items-center justify-center" style={{ width: '52px' }}>
                <span className="text-[10px] font-bold font-mono">{player.speed.toFixed(2)}x</span>
              </IpodBox>
              <IpodBox className="px-2 py-0.5 flex items-center">
                <button
                  onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
                  className="text-[10px] uppercase tracking-wider font-bold"
                  style={{ color: 'inherit' }}
                >
                  {player.varispeedMode === 'timestretch' ? 'STRETCH' : 'NATURAL'}
                </button>
              </IpodBox>
            </div>
          </div>

          {/* Reverb — compact, tucked right */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ transform: 'scale(0.7)', transformOrigin: 'top right', marginBottom: '-8px' }}>
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={ipodBorder}
              elementBgColor="transparent"
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 rounded-none transition-colors"
                    style={{ color: 'inherit' }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* ── Track List (multi-track only) ── */}
        {tracks.length > 1 && (
          <IpodBox>
            <TrackList
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              foregroundColor={ipodBorder}
              elementBgColor="transparent"
              themeVariant={themeVariant}
            />
          </IpodBox>
        )}

        {/* Marquee CSS animation — only applied when text overflows */}
        <style>{`
          .ipod-audio-marquee {
            animation: ipodMarquee 18s linear infinite;
          }
          @keyframes ipodMarquee {
            0%, 10% { transform: translateX(0); }
            45%, 55% { transform: translateX(calc(-100% + ${marqueeContainerRef.current?.clientWidth ?? 200}px)); }
            90%, 100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    )
  }

  // ─── DEFAULT + RECEIPT THEMES ───

  const themeClasses = cn(
    'flex flex-col',
    isReceipt ? 'gap-2' : 'gap-4',
    {
      'audio-player-receipt': themeVariant === 'receipt',
    },
    className
  )

  const themeStyle: React.CSSProperties = {}

  if (themeVariant === 'receipt') {
    themeStyle.fontFamily = 'var(--font-ticket-de-caisse), monospace'
    themeStyle.color = '#000'
  }

  return (
    <>
      {/* Receipt theme: Section header and divider */}
      {themeVariant === 'receipt' && (
        <>
          <div className="receipt-divider">{'-'.repeat(60)}</div>
          <div className="text-center py-2 font-bold text-sm">
            ** NOW PLAYING **
          </div>
          <div className="receipt-divider">{'-'.repeat(60)}</div>
        </>
      )}

      <div className={themeClasses} style={themeStyle}>
        {/* Top row: Album art, Play/Pause, Track info */}
        <div className={cn("flex items-start", isReceipt ? "gap-2 items-center" : "gap-3")}>
        {/* Album Art — receipt: shown behind play button; other themes: separate */}
        {albumArtUrl && !isReceipt && (
          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={albumArtUrl}
              alt="Album art"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Play/Pause Control */}
        <div className="flex-shrink-0 relative">
          {isReceipt && albumArtUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={albumArtUrl}
                alt=""
                fill
                className="object-cover"
                style={{ filter: 'grayscale(100%) contrast(1.2)' }}
              />
            </div>
          )}
          <PlayerControls
            isPlaying={player.isPlaying}
            isLoaded={player.isLoaded}
            isLoading={player.isLoading}
            onTogglePlay={handlePlay}
            foregroundColor={effectiveForegroundColor}
            elementBgColor={isReceipt ? (albumArtUrl ? 'rgba(0,0,0,0.5)' : '#1a1a1a') : effectiveElementBgColor}
            themeVariant={themeVariant}
          />
        </div>

        {/* Track Info */}
        {currentTrack && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3
              className={cn("font-semibold truncate", isReceipt ? "text-sm" : "text-base")}
              style={{ color: effectiveForegroundColor || 'inherit' }}
            >
              {currentTrack.title}
            </h3>
            {!isReceipt && (
              <p
                className="text-sm truncate"
                style={{ color: effectiveForegroundColor || 'inherit', opacity: 0.7 }}
              >
                {currentTrack.artist}
              </p>
            )}
            <p
              className="text-xs font-mono"
              style={{ color: effectiveForegroundColor || 'inherit', opacity: 0.5 }}
            >
              {currentTrack.artist && isReceipt ? `${currentTrack.artist} · ` : ''}
              {Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}
            </p>
          </div>
        )}
      </div>

      {/* Waveform/Progress Bar with time display */}
      <WaveformDisplay
        showWaveform={showWaveform}
        waveformData={waveformData}
        progress={player.progress}
        currentTime={player.currentTime}
        duration={player.duration}
        onSeek={player.seek}
        foregroundColor={effectiveForegroundColor}
        elementBgColor={effectiveElementBgColor}
        themeVariant={themeVariant}
      />

      {isReceipt ? (
        /* Receipt: Varispeed + Reverb side by side in a compact row */
        <div data-no-drag className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <VarispeedSlider
              speed={player.speed}
              mode={player.varispeedMode}
              onSpeedChange={player.setSpeed}
              onModeChange={player.setVarispeedMode}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 rounded-none transition-colors"
                    style={{
                      backgroundColor: effectiveElementBgColor || 'rgba(0, 0, 0, 0.1)',
                      color: effectiveForegroundColor || 'currentColor'
                    }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        /* Default layout: Varispeed full width, then Reverb below */
        <>
          <VarispeedSlider
            speed={player.speed}
            mode={player.varispeedMode}
            onSpeedChange={player.setSpeed}
            onModeChange={player.setVarispeedMode}
            foregroundColor={effectiveForegroundColor}
            elementBgColor={effectiveElementBgColor}
            themeVariant={themeVariant}
          />

          <div className="flex items-center justify-center gap-2">
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: effectiveElementBgColor || 'rgba(0, 0, 0, 0.1)',
                      color: effectiveForegroundColor || 'currentColor'
                    }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                }
              />
            )}
          </div>
        </>
      )}

      {/* Track List (multi-track only) */}
      <TrackList
        tracks={tracks}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackSelect}
        foregroundColor={effectiveForegroundColor}
        elementBgColor={effectiveElementBgColor}
        themeVariant={themeVariant}
      />
    </div>

      {/* Receipt theme: Closing divider */}
      {themeVariant === 'receipt' && (
        <div className="receipt-divider">{'-'.repeat(60)}</div>
      )}

    </>
  )
}
