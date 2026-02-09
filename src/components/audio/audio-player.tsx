'use client'

import { useState } from 'react'
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

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

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
  reverbConfig?: ReverbConfig
  playerColors?: AudioCardContent['playerColors']
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
  reverbConfig,
  playerColors,
  cardId,
  pageId,
  isEditing = false,
  onContentChange,
  themeVariant = 'instagram-reels',
  className = ''
}: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : undefined
  const currentTrackUrl = currentTrack?.audioUrl

  // Use the audio player hook (must be called before any early returns)
  const player = useAudioPlayer({
    cardId,
    trackUrl: currentTrackUrl,
    looping,
    reverbConfig,
    onEnded: () => {
      // Auto-advance to next track if multi-track and not looping
      if (!looping && tracks.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % tracks.length
        setCurrentTrackIndex(nextIndex)
      }
    }
  })

  if (tracks.length === 0) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        <p className="text-sm">No audio uploaded yet</p>
        {isEditing && <p className="text-xs mt-1">Upload a track to get started</p>}
      </div>
    )
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
  const isSystemSettings = themeVariant === 'system-settings'
  const isCompact = isReceipt || isVcr || isClassified || isSystemSettings

  // Color overrides per theme
  // VCR: follow theme text color (var(--theme-text)); receipt: force black; classified/system-settings: theme text
  const effectiveForegroundColor = isReceipt ? '#1a1a1a' : (isVcr || isClassified || isSystemSettings) ? 'var(--theme-text)' : playerColors?.foregroundColor
  const effectiveElementBgColor = (isReceipt || isVcr || isClassified || isSystemSettings) ? 'transparent' : playerColors?.elementBgColor

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
        <div className="flex items-stretch gap-0 px-3 py-2">
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
          <div className="flex items-stretch gap-0 px-3 py-2">
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

  // ─── SYSTEM SETTINGS / POOLSUITE FM THEME ───
  if (isSystemSettings) {
    const psColor = 'var(--theme-text)'
    const psFont: React.CSSProperties = {
      fontFamily: 'var(--font-chikarego), var(--font-ishmeria), monospace',
      color: psColor,
    }
    // All borders are black, thin, rounded — the Poolsuite way
    const psBorder = '1px solid var(--theme-text)'
    const psRadius = '4px'
    // Teal highlight for active play button (Poolsuite signature)
    const activeTeal = 'oklch(0.88 0.06 180)'
    // Pink accent for add/extra button
    const accentPink = 'oklch(0.88 0.06 0)'
    // Shared inner box style — little rounded bordered boxes inside the card
    const psBox: React.CSSProperties = {
      border: psBorder,
      borderRadius: psRadius,
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
        {/* ── Box 1: Track Info ── */}
        {currentTrack && (
          <div className="px-3 py-2" style={psBox}>
            <div className="text-sm font-bold truncate" style={{ color: psColor }}>
              {currentTrack.title}
              {currentTrack.artist && (
                <span className="font-normal opacity-50"> — {currentTrack.artist}</span>
              )}
            </div>
          </div>
        )}

        {/* ── Box 2: Time + Transport ── */}
        <div className="flex items-center gap-3 px-3 py-2.5" style={psBox}>
          {/* Left: play indicator + time */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] opacity-40 leading-none mb-1" style={psFont}>
              {player.isPlaying ? '▶' : '\u00A0'}
            </div>
            <div className="text-lg font-bold tabular-nums leading-none" style={psFont}>
              {formatPoolsuiteTime(player.currentTime)}
            </div>
          </div>

          {/* Right: transport buttons row */}
          <div
            className="flex items-stretch flex-shrink-0"
            style={{ border: psBorder, borderRadius: psRadius, overflow: 'hidden' }}
          >
            {/* Play */}
            <button
              onClick={handlePlay}
              disabled={!player.isLoaded && !player.isLoading}
              className={cn(
                'poolsuite-transport-btn flex items-center justify-center w-11 h-10',
                player.isPlaying && 'poolsuite-active'
              )}
              style={{
                backgroundColor: player.isPlaying ? activeTeal : 'var(--theme-card-bg)',
                borderRight: psBorder,
                borderRadius: 0,
                opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
              }}
              aria-label="Play"
            >
              <span className="text-base leading-none" style={{ color: psColor }}>▶</span>
            </button>

            {/* Pause */}
            <button
              onClick={handlePlay}
              disabled={!player.isLoaded && !player.isLoading}
              className={cn(
                'poolsuite-transport-btn flex items-center justify-center w-11 h-10',
                !player.isPlaying && player.isLoaded && 'poolsuite-active'
              )}
              style={{
                backgroundColor: !player.isPlaying && player.isLoaded ? activeTeal : 'var(--theme-card-bg)',
                borderRight: psBorder,
                borderRadius: 0,
                opacity: !player.isLoaded && !player.isLoading ? 0.5 : 1,
              }}
              aria-label="Pause"
            >
              <span className="text-base leading-none font-bold" style={{ color: psColor }}>‖</span>
            </button>

            {/* Prev */}
            {tracks.length > 1 && (
              <button
                onClick={() => {
                  const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
                  handleTrackSelect(prevIndex)
                }}
                className="poolsuite-transport-btn flex items-center justify-center w-11 h-10"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderRight: psBorder,
                  borderRadius: 0,
                }}
                aria-label="Previous track"
              >
                <span className="text-xs leading-none" style={{ color: psColor }}>◀◀</span>
              </button>
            )}

            {/* Next */}
            {tracks.length > 1 && (
              <button
                onClick={() => {
                  const nextIndex = (currentTrackIndex + 1) % tracks.length
                  handleTrackSelect(nextIndex)
                }}
                className="poolsuite-transport-btn flex items-center justify-center w-11 h-10"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderRight: psBorder,
                  borderRadius: 0,
                }}
                aria-label="Next track"
              >
                <span className="text-xs leading-none" style={{ color: psColor }}>▶▶</span>
              </button>
            )}

            {/* Music note accent (pink) */}
            <button
              onClick={() => player.setReverbMix(player.reverbMix > 0 ? 0 : 0.3)}
              className="poolsuite-transport-btn flex items-center justify-center w-11 h-10"
              style={{
                backgroundColor: player.reverbMix > 0 ? accentPink : 'var(--theme-card-bg)',
                borderRadius: 0,
                border: 'none',
              }}
              aria-label="Toggle reverb"
            >
              <span className="text-sm leading-none" style={{ color: psColor }}>♪</span>
            </button>
          </div>
        </div>

        {/* ── Box 3: Progress Bar ── */}
        <div className="px-3 py-2.5" style={psBox}>
          <div
            className="poolsuite-inset-track relative h-5 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
              player.seek(pos)
            }}
          >
            {/* Filled portion (solid cream) */}
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--theme-card-bg)',
                borderRadius: '3px 0 0 3px',
              }}
            />
            {/* Unfilled portion (halftone dots) */}
            <div
              className="poolsuite-halftone absolute top-0 h-full"
              style={{
                left: `${progressPercent}%`,
                right: 0,
                backgroundColor: 'var(--theme-accent, oklch(0.95 0 0))',
                borderRadius: progressPercent === 0 ? '3px' : '0 3px 3px 0',
              }}
            />
            {/* Visual thumb marker */}
            <div
              className="absolute top-0 h-full w-[3px] z-[5]"
              style={{
                left: `${progressPercent}%`,
                transform: 'translateX(-50%)',
                backgroundColor: psColor,
                opacity: 0.5,
              }}
            />
          </div>
          {/* Time display */}
          <div className="flex justify-between mt-1.5 text-[10px] tabular-nums" style={{ color: psColor, opacity: 0.45 }}>
            <span>{formatPoolsuiteTime(player.currentTime)}</span>
            <span>{formatPoolsuiteTime(player.duration)}</span>
          </div>
        </div>

        {/* ── Box 4: Varispeed + Reverb side by side ── */}
        <div className="flex items-stretch gap-2">
          {/* Left box: Varispeed slider */}
          <div className="flex-1 min-w-0 px-3 py-2.5" style={psBox}>
            {/* Header: speed value + mode toggle */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold tabular-nums" style={{ color: psColor }}>
                {player.speed.toFixed(2)}x
              </span>
              <button
                onClick={() => player.setVarispeedMode(player.varispeedMode === 'timestretch' ? 'natural' : 'timestretch')}
                className="poolsuite-transport-btn px-2 py-0.5 text-[9px] uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  color: psColor,
                  borderRadius: '3px',
                }}
              >
                {player.varispeedMode === 'timestretch' ? 'Stretch' : 'Natural'}
              </button>
            </div>

            {/* Tick marks */}
            <div className="flex justify-between mb-1 px-0.5">
              {[0.5, 1.0, 1.5].map((tick) => (
                <span key={tick} className="text-[8px] tabular-nums" style={{ color: psColor, opacity: 0.35 }}>
                  {tick}x
                </span>
              ))}
            </div>

            {/* Inset slider track with halftone fill */}
            <div className="poolsuite-inset-track relative h-5">
              {/* Filled portion (solid cream) */}
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${varispeedPercent}%`,
                  backgroundColor: 'var(--theme-card-bg)',
                  borderRadius: '3px 0 0 3px',
                }}
              />
              {/* Unfilled portion (halftone dots) */}
              <div
                className="poolsuite-halftone absolute top-0 h-full"
                style={{
                  left: `${varispeedPercent}%`,
                  right: 0,
                  backgroundColor: 'var(--theme-accent, oklch(0.95 0 0))',
                  borderRadius: varispeedPercent === 0 ? '3px' : '0 3px 3px 0',
                }}
              />
              {/* Range input overlay */}
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={player.speed}
                onChange={(e) => player.setSpeed(parseFloat(e.target.value))}
                className="absolute inset-0 z-10"
                style={{ opacity: 0 }}
                aria-label="Varispeed"
              />
              {/* Visual thumb marker */}
              <div
                className="absolute top-0 h-full w-[3px] z-[5]"
                style={{
                  left: `${varispeedPercent}%`,
                  transform: 'translateX(-50%)',
                  backgroundColor: psColor,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>

          {/* Right box: Reverb knob — transparent with color */}
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 px-4 py-2.5" style={psBox}>
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={psColor}
              elementBgColor="transparent"
              themeVariant={themeVariant}
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
              themeVariant={themeVariant}
            />
          </div>
        )}
      </div>
    )
  }

  // ─── DEFAULT + RECEIPT THEMES ───

  const themeClasses = cn(
    'flex flex-col',
    isReceipt ? 'gap-2' : 'gap-4',
    {
      'audio-player-macintosh': themeVariant === 'mac-os',
      'audio-player-receipt': themeVariant === 'receipt',
      'audio-player-ipod': themeVariant === 'ipod-classic',
    },
    className
  )

  const themeStyle: React.CSSProperties = {}

  if (themeVariant === 'mac-os') {
    themeStyle.fontFamily = "var(--font-pix-chicago), 'Chicago', monospace"
  } else if (themeVariant === 'receipt') {
    themeStyle.fontFamily = 'var(--font-ticket-de-caisse), monospace'
    themeStyle.color = '#000'
  } else if (themeVariant === 'ipod-classic') {
    themeStyle.fontFamily = "var(--font-chicago), system-ui"
    themeStyle.fontSize = '0.875rem'
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
        <div className="flex items-start gap-3">
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
