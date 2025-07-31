"use client"

import { useState, useRef, useEffect } from "react"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [tracks, setTracks] = useState<Array<{ name: string; src: string; id: string }>>([])
  const [hasValidAudio, setHasValidAudio] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [trackName, setTrackName] = useState("Loading tracks...")

  // Загружаем треки из GitHub репозитория
  useEffect(() => {
    const loadTracksFromGitHub = async () => {
      setIsLoading(true)
      try {
        // Получаем список файлов из папки /public/music через GitHub API
        const response = await fetch("https://api.github.com/repos/Riizzahub/JukonSite/contents/public/music", {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        })

        if (response.ok) {
          const files = await response.json()
          const audioFiles = files.filter(
            (file: any) =>
              file.name.endsWith(".mp3") ||
              file.name.endsWith(".wav") ||
              file.name.endsWith(".ogg") ||
              file.name.endsWith(".m4a"),
          )

          const trackList = audioFiles.map((file: any, index: number) => ({
            id: `github-${index}`,
            name: file.name.replace(/\.[^/.]+$/, ""), // Убираем расширение
            src: `/music/${file.name}`, // Путь к файлу в public
          }))

          setTracks(trackList)

          if (trackList.length > 0) {
            setTrackName(trackList[0].name)
          } else {
            setTrackName("No tracks found")
          }
        } else {
          // Если нет доступа к GitHub API, просто показываем пустой плеер
          setTracks([])
          setTrackName("No tracks available")
        }
      } catch (error) {
        console.error("Failed to load tracks from GitHub:", error)
        setTracks([])
        setTrackName("No tracks available")
      } finally {
        setIsLoading(false)
      }
    }

    loadTracksFromGitHub()
  }, [])

  // Проверяем доступность аудио файла
  const checkAudioAvailability = async (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.oncanplay = () => resolve(true)
      audio.onerror = () => resolve(false)
      audio.src = src
    })
  }

  // Устанавливаем текущий трек
  const setCurrentAudioTrack = async (trackIndex: number) => {
    if (!audioRef.current || !tracks[trackIndex]) return

    const track = tracks[trackIndex]
    audioRef.current.src = track.src
    setTrackName(track.name)

    // Проверяем доступность трека
    const isAvailable = await checkAudioAvailability(track.src)
    setHasValidAudio(isAvailable)

    if (!isAvailable) {
      console.warn(`Track "${track.name}" is not available`)
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (tracks.length > 0) {
      setCurrentAudioTrack(currentTrack)
    }
  }, [currentTrack, tracks])

  const togglePlay = async () => {
    if (!audioRef.current) return

    // Если нет треков или текущий трек недоступен
    if (tracks.length === 0) {
      alert("No tracks available. Please add music files to the GitHub repository in /public/music folder.")
      return
    }

    if (!hasValidAudio) {
      alert("Current track is unavailable. Please check if the music file exists in the repository.")
      return
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Initialize audio context for visualization
        if (!audioContextRef.current && audioRef.current.src) {
          try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            analyserRef.current = audioContextRef.current.createAnalyser()
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
            sourceRef.current.connect(analyserRef.current)
            analyserRef.current.connect(audioContextRef.current.destination)
            analyserRef.current.fftSize = 256

            startVisualization()
          } catch (contextError) {
            console.warn("Audio context initialization failed:", contextError)
          }
        }

        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Audio playback failed:", error)
      setIsPlaying(false)
      setHasValidAudio(false)

      // Пробуем следующий доступный трек
      if (tracks.length > 1) {
        nextTrack()
      } else {
        alert("Failed to play audio. Please check if the music files exist in the repository.")
      }
    }
  }

  const nextTrack = async () => {
    if (tracks.length === 0) return

    let nextIndex = (currentTrack + 1) % tracks.length
    let attempts = 0

    // Ищем следующий доступный трек
    while (attempts < tracks.length) {
      const isAvailable = await checkAudioAvailability(tracks[nextIndex].src)
      if (isAvailable) {
        // Останавливаем текущее воспроизведение
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }

        setCurrentTrack(nextIndex)
        setIsPlaying(false)

        // Ждем обновления трека и затем начинаем воспроизведение
        setTimeout(async () => {
          if (audioRef.current && hasValidAudio) {
            try {
              await audioRef.current.play()
              setIsPlaying(true)
            } catch (error) {
              console.error("Auto-play failed:", error)
              setIsPlaying(false)
            }
          }
        }, 300)
        return
      }
      nextIndex = (nextIndex + 1) % tracks.length
      attempts++
    }

    alert("No available tracks for playback")
  }

  const prevTrack = async () => {
    if (tracks.length === 0) return

    let prevIndex = (currentTrack - 1 + tracks.length) % tracks.length
    let attempts = 0

    // Ищем предыдущий доступный трек
    while (attempts < tracks.length) {
      const isAvailable = await checkAudioAvailability(tracks[prevIndex].src)
      if (isAvailable) {
        // Останавливаем текущее воспроизведение
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }

        setCurrentTrack(prevIndex)
        setIsPlaying(false)

        // Ждем обновления трека и затем начинаем воспроизведение
        setTimeout(async () => {
          if (audioRef.current && hasValidAudio) {
            try {
              await audioRef.current.play()
              setIsPlaying(true)
            } catch (error) {
              console.error("Auto-play failed:", error)
              setIsPlaying(false)
            }
          }
        }, 300)
        return
      }
      prevIndex = (prevIndex - 1 + tracks.length) % tracks.length
      attempts++
    }

    alert("No available tracks for playback")
  }

  const refreshTracks = async () => {
    setIsLoading(true)
    setTrackName("Refreshing tracks...")

    // Перезагружаем треки из GitHub
    try {
      const response = await fetch("https://api.github.com/repos/Riizzahub/JukonSite/contents/public/music", {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const files = await response.json()
        const audioFiles = files.filter(
          (file: any) =>
            file.name.endsWith(".mp3") ||
            file.name.endsWith(".wav") ||
            file.name.endsWith(".ogg") ||
            file.name.endsWith(".m4a"),
        )

        const trackList = audioFiles.map((file: any, index: number) => ({
          id: `github-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          src: `/music/${file.name}`,
        }))

        setTracks(trackList)
        setCurrentTrack(0)
        setIsPlaying(false)

        if (trackList.length > 0) {
          setTrackName(trackList[0].name)
        } else {
          setTrackName("No tracks found")
        }

        alert(`Refreshed! Found ${trackList.length} tracks in the repository.`)
      }
    } catch (error) {
      console.error("Failed to refresh tracks:", error)
      alert("Failed to refresh tracks from GitHub.")
    } finally {
      setIsLoading(false)
    }
  }

  const startVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current) return

      requestAnimationFrame(draw)
      analyserRef.current.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "#FF0000")
        gradient.addColorStop(0.5, "#8A2BE2")
        gradient.addColorStop(1, "#FF00FF")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }
    }

    draw()
  }

  // Демо визуализация
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let animationId: number

      const drawDemo = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barCount = 32
        const barWidth = canvas.width / barCount

        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.sin(Date.now() * 0.005 + i * 0.5) * 15 + 20

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
          gradient.addColorStop(0, "#FF0000")
          gradient.addColorStop(0.5, "#8A2BE2")
          gradient.addColorStop(1, "#FF00FF")

          ctx.fillStyle = gradient
          ctx.globalAlpha = isPlaying && hasValidAudio ? 0.8 : 0.3
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight)
        }

        animationId = requestAnimationFrame(drawDemo)
      }

      drawDemo()

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [isPlaying, hasValidAudio])

  const getStatusText = () => {
    if (isLoading) {
      return "Loading tracks from GitHub..."
    }
    if (tracks.length === 0) {
      return "No tracks • Add to GitHub repo"
    }
    if (!hasValidAudio) {
      return "Track unavailable • Check repo"
    }
    return isPlaying ? "Playing" : "Ready"
  }

  // Автоматическое воспроизведение при смене трека
  useEffect(() => {
    if (hasValidAudio && audioRef.current && currentTrack >= 0 && !isLoading) {
      const playNewTrack = async () => {
        try {
          // Небольшая задержка для загрузки нового трека
          await new Promise((resolve) => setTimeout(resolve, 200))

          if (audioRef.current && audioRef.current.readyState >= 2) {
            await audioRef.current.play()
            setIsPlaying(true)
          }
        } catch (error) {
          console.error("Auto-play failed:", error)
          setIsPlaying(false)
        }
      }

      // Запускаем автовоспроизведение только если пользователь переключил трек
      const timeoutId = setTimeout(playNewTrack, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [currentTrack, hasValidAudio, isLoading])

  return (
    <div className="audio-player">
      <audio ref={audioRef} loop preload="none" />

      <div className="player-container">
        <canvas ref={canvasRef} width={80} height={50} className="visualizer" />

        <div className="track-info">
          <div className="track-name">{trackName}</div>
          <div className="track-status">
            {getStatusText()} • {tracks.length} треков
            <span className="github-badge">GITHUB</span>
          </div>
        </div>

        <div className="controls">
          <button
            onClick={prevTrack}
            className="control-btn"
            aria-label="Previous track"
            disabled={tracks.length <= 1 || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="play-button"
            aria-label={isPlaying ? "Pause music" : "Play music"}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="animate-spin">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : tracks.length === 0 || !hasValidAudio ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            className="control-btn"
            aria-label="Next track"
            disabled={tracks.length <= 1 || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 18h2V6h-2zm-3.5-6L4 6v12z" />
            </svg>
          </button>
        </div>

        <div className="volume-control">
          <svg className="volume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>

        <button
          onClick={refreshTracks}
          className="refresh-btn"
          aria-label="Refresh tracks from GitHub"
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={isLoading ? "animate-spin" : ""}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* GitHub Instructions */}
      <div className="github-info">
        <div className="info-header">
          <svg viewBox="0 0 24 24" fill="currentColor" className="github-icon">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>Add Music via GitHub</span>
        </div>
        <div className="info-text">
          Upload MP3/WAV files to <code>/public/music/</code> folder in the repository
        </div>
      </div>

      <style jsx>{`
        .audio-player {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .player-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(138, 43, 226, 0.5);
          border-radius: 20px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 0 50px rgba(138, 43, 226, 0.3);
          min-width: 450px;
        }

        .visualizer {
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.3);
        }

        .track-info {
          flex: 1;
          min-width: 120px;
        }

        .track-name {
          font-size: 0.85rem;
          color: #ffffff;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Orbitron', monospace;
          margin-bottom: 2px;
        }

        .track-status {
          font-size: 0.7rem;
          color: #8A2BE2;
          opacity: 0.8;
          font-family: 'Exo 2', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .github-badge {
          background: linear-gradient(45deg, #333, #666);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.6rem;
          font-weight: bold;
          text-shadow: none;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-btn, .refresh-btn {
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 50%;
          background: rgba(138, 43, 226, 0.3);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .control-btn:hover:not(:disabled), .refresh-btn:hover:not(:disabled) {
          background: rgba(138, 43, 226, 0.6);
          transform: scale(1.1);
        }

        .control-btn:disabled, .refresh-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .control-btn svg, .refresh-btn svg {
          width: 16px;
          height: 16px;
        }

        .refresh-btn {
          background: rgba(34, 197, 94, 0.3);
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.6);
        }

        .play-button {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(45deg, #8A2BE2, #FF0000);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(138, 43, 226, 0.4);
        }

        .play-button:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(138, 43, 226, 0.6);
        }

        .play-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .play-button svg {
          width: 24px;
          height: 24px;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-icon {
          width: 16px;
          height: 16px;
          color: rgba(255, 255, 255, 0.6);
        }

        .volume-slider {
          width: 80px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8A2BE2, #FF0000);
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(138, 43, 226, 0.5);
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8A2BE2, #FF0000);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(138, 43, 226, 0.5);
        }

        .github-info {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 15px;
          max-width: 450px;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Orbitron', monospace;
          font-size: 0.9rem;
          color: #22C55E;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .github-icon {
          width: 16px;
          height: 16px;
        }

        .info-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Exo 2', sans-serif;
        }

        .info-text code {
          background: rgba(34, 197, 94, 0.2);
          color: #22C55E;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .audio-player {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .player-container {
            min-width: auto;
            padding: 0.8rem;
            gap: 0.8rem;
          }

          .github-info {
            max-width: none;
          }

          .track-info {
            min-width: 80px;
          }

          .track-name {
            font-size: 0.75rem;
          }

          .track-status {
            font-size: 0.65rem;
          }

          .play-button {
            width: 40px;
            height: 40px;
          }

          .play-button svg {
            width: 20px;
            height: 20px;
          }

          .control-btn, .refresh-btn {
            width: 30px;
            height: 30px;
          }

          .control-btn svg, .refresh-btn svg {
            width: 14px;
            height: 14px;
          }

          .volume-slider {
            width: 60px;
          }

          .visualizer {
            width: 60px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  )
}
