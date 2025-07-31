"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [password, setPassword] = useState("")
  const [customTracks, setCustomTracks] = useState<Array<{ name: string; src: string; id: string }>>([])
  const [hasValidAudio, setHasValidAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Секретный пароль для доступа к загрузке музыки
  const ADMIN_PASSWORD = "jukon2024"

  // Предустановленные треки (только если файлы существуют)
  const defaultTracks = [
    {
      id: "default-1",
      name: "Demo Track 1",
      src: "/music/demo1.mp3",
    },
    {
      id: "default-2",
      name: "Demo Track 2",
      src: "/music/demo2.mp3",
    },
  ]

  // Объединяем предустановленные и пользовательские треки
  const allTracks = [...defaultTracks, ...customTracks]

  const [trackName, setTrackName] = useState("No audio loaded")

  // Загружаем сохраненные треки из localStorage при инициализации
  useEffect(() => {
    const savedTracks = localStorage.getItem("jukon-custom-tracks")
    const savedAuth = localStorage.getItem("jukon-admin-session")

    if (savedTracks) {
      try {
        const parsedTracks = JSON.parse(savedTracks)
        setCustomTracks(parsedTracks)
      } catch (error) {
        console.error("Error loading saved tracks:", error)
      }
    }

    // Проверяем сессию администратора (действует 24 часа)
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      const now = Date.now()
      if (now - authData.timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("jukon-admin-session")
      }
    }
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

  // Сохраняем пользовательские треки в localStorage
  const saveCustomTracks = (tracks: Array<{ name: string; src: string; id: string }>) => {
    localStorage.setItem("jukon-custom-tracks", JSON.stringify(tracks))
  }

  // Устанавливаем текущий трек
  const setCurrentAudioTrack = async (trackIndex: number) => {
    if (!audioRef.current || !allTracks[trackIndex]) return

    const track = allTracks[trackIndex]
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
    setCurrentAudioTrack(currentTrack)
  }, [currentTrack, customTracks])

  const handleAuth = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setPassword("")

      // Сохраняем сессию администратора
      localStorage.setItem(
        "jukon-admin-session",
        JSON.stringify({
          timestamp: Date.now(),
          authenticated: true,
        }),
      )

      // Открываем диалог загрузки файла
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 100)
    } else {
      alert("Неверный пароль! Доступ запрещен.")
      setPassword("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      alert("Доступ запрещен! Только администратор может загружать музыку.")
      return
    }

    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: file.type })
        const url = URL.createObjectURL(blob)
        const fileName = file.name.replace(/\.[^/.]+$/, "")
        const trackId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const newTrack = {
          id: trackId,
          name: fileName,
          src: url,
        }

        // Добавляем трек в список пользовательских треков
        const updatedCustomTracks = [...customTracks, newTrack]
        setCustomTracks(updatedCustomTracks)
        saveCustomTracks(updatedCustomTracks)

        // Переключаемся на новый трек
        const newTrackIndex = allTracks.length // Индекс нового трека будет равен текущей длине массива
        setCurrentTrack(newTrackIndex)
        setIsPlaying(false)

        // Автоматически начинаем воспроизведение нового загруженного трека
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
        }, 500)

        console.log("Администратор добавил постоянный трек:", fileName)
        alert(`Трек "${fileName}" успешно добавлен в систему!`)
      }

      reader.onerror = () => {
        alert("Ошибка при загрузке файла!")
      }

      reader.readAsArrayBuffer(file)
    }

    // Очищаем input для возможности загрузки того же файла снова
    event.target.value = ""
  }

  const removeTrack = (trackId: string) => {
    if (!isAuthenticated) {
      alert("Доступ запрещен!")
      return
    }

    // Нельзя удалять предустановленные треки
    if (trackId.startsWith("default-")) {
      alert("Нельзя удалить предустановленный трек!")
      return
    }

    const updatedCustomTracks = customTracks.filter((track) => track.id !== trackId)
    setCustomTracks(updatedCustomTracks)
    saveCustomTracks(updatedCustomTracks)

    // Если удаляем текущий трек, переключаемся на первый доступный
    const trackIndex = allTracks.findIndex((track) => track.id === trackId)
    if (trackIndex === currentTrack) {
      setCurrentTrack(0)
      setIsPlaying(false)
    } else if (trackIndex < currentTrack) {
      setCurrentTrack(currentTrack - 1)
    }

    alert("Трек удален из системы!")
  }

  const togglePlay = async () => {
    if (!audioRef.current) return

    // Если нет треков или текущий трек недоступен
    if (allTracks.length === 0) {
      if (!isAuthenticated) {
        setShowAuthModal(true)
        return
      } else {
        fileInputRef.current?.click()
        return
      }
    }

    if (!hasValidAudio) {
      alert("Текущий трек недоступен. Попробуйте другой трек или загрузите новый.")
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
      if (allTracks.length > 1) {
        nextTrack()
      } else {
        alert("Не удалось воспроизвести аудио. Пожалуйста, загрузите корректный аудио файл.")
      }
    }
  }

  const nextTrack = async () => {
    if (allTracks.length === 0) return

    let nextIndex = (currentTrack + 1) % allTracks.length
    let attempts = 0

    // Ищем следующий доступный трек
    while (attempts < allTracks.length) {
      const isAvailable = await checkAudioAvailability(allTracks[nextIndex].src)
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
      nextIndex = (nextIndex + 1) % allTracks.length
      attempts++
    }

    alert("Нет доступных треков для воспроизведения")
  }

  const prevTrack = async () => {
    if (allTracks.length === 0) return

    let prevIndex = (currentTrack - 1 + allTracks.length) % allTracks.length
    let attempts = 0

    // Ищем предыдущий доступный трек
    while (attempts < allTracks.length) {
      const isAvailable = await checkAudioAvailability(allTracks[prevIndex].src)
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
      prevIndex = (prevIndex - 1 + allTracks.length) % allTracks.length
      attempts++
    }

    alert("Нет доступных треков для воспроизведения")
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("jukon-admin-session")
    alert("Вы вышли из режима администратора")
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
    if (allTracks.length === 0) {
      return "No tracks • Click to upload"
    }
    if (!hasValidAudio) {
      return "Track unavailable • Upload new"
    }
    return isPlaying ? "Playing" : "Ready"
  }

  // Автоматическое воспроизведение при смене трека
  useEffect(() => {
    if (hasValidAudio && audioRef.current && currentTrack >= 0) {
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
  }, [currentTrack, hasValidAudio])

  return (
    <div className="audio-player">
      <audio ref={audioRef} loop preload="none" />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <h3>Доступ ограничен</h3>
            <p>Только администратор может загружать музыку</p>
            <div className="auth-form">
              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                className="password-input"
              />
              <div className="auth-buttons">
                <button onClick={handleAuth} className="auth-btn confirm">
                  Войти
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    setPassword("")
                  }}
                  className="auth-btn cancel"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="player-container">
        <canvas ref={canvasRef} width={80} height={50} className="visualizer" />

        <div className="track-info">
          <div className="track-name">{trackName}</div>
          <div className="track-status">
            {getStatusText()} • {allTracks.length} треков
            {isAuthenticated && <span className="admin-badge">ADMIN</span>}
          </div>
        </div>

        <div className="controls">
          <button
            onClick={prevTrack}
            className="control-btn"
            aria-label="Previous track"
            disabled={allTracks.length <= 1}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button onClick={togglePlay} className="play-button" aria-label={isPlaying ? "Pause music" : "Play music"}>
            {allTracks.length === 0 || !hasValidAudio ? (
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

          <button onClick={nextTrack} className="control-btn" aria-label="Next track" disabled={allTracks.length <= 1}>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="file-input"
          style={{ display: "none" }}
        />

        <button onClick={handleUploadClick} className="upload-btn" aria-label="Upload music file (Admin only)">
          {isAuthenticated ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
        </button>

        {isAuthenticated && (
          <button onClick={logout} className="logout-btn" aria-label="Logout from admin mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Admin Track Management */}
      {isAuthenticated && customTracks.length > 0 && (
        <div className="track-manager">
          <h4>Управление треками ({customTracks.length})</h4>
          <div className="track-list">
            {customTracks.map((track) => (
              <div key={track.id} className="track-item">
                <span className="track-item-name">{track.name}</span>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="remove-btn"
                  aria-label={`Remove ${track.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .audio-player {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .auth-modal {
          background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(255, 0, 0, 0.1));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(138, 43, 226, 0.5);
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(138, 43, 226, 0.3);
        }

        .auth-modal h3 {
          font-family: 'Orbitron', monospace;
          font-size: 1.5rem;
          color: #FF00FF;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }

        .auth-modal p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .password-input {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(138, 43, 226, 0.3);
          border-radius: 10px;
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .password-input:focus {
          border-color: #FF00FF;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
        }

        .auth-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Orbitron', monospace;
        }

        .auth-btn.confirm {
          background: linear-gradient(45deg, #8A2BE2, #FF0000);
          color: white;
        }

        .auth-btn.confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(138, 43, 226, 0.4);
        }

        .auth-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .auth-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.2);
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

        .admin-badge {
          background: linear-gradient(45deg, #FF0000, #FF00FF);
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

        .control-btn {
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

        .control-btn:hover:not(:disabled) {
          background: rgba(138, 43, 226, 0.6);
          transform: scale(1.1);
        }

        .control-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .control-btn svg {
          width: 16px;
          height: 16px;
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

        .play-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(138, 43, 226, 0.6);
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

        .upload-btn, .logout-btn {
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 0, 255, 0.3);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .upload-btn:hover, .logout-btn:hover {
          background: rgba(255, 0, 255, 0.6);
          transform: scale(1.1);
        }

        .logout-btn {
          background: rgba(255, 0, 0, 0.3);
        }

        .logout-btn:hover {
          background: rgba(255, 0, 0, 0.6);
        }

        .upload-btn svg, .logout-btn svg {
          width: 16px;
          height: 16px;
        }

        .track-manager {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(138, 43, 226, 0.3);
          border-radius: 15px;
          max-width: 450px;
        }

        .track-manager h4 {
          font-family: 'Orbitron', monospace;
          font-size: 0.9rem;
          color: #FF00FF;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .track-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 150px;
          overflow-y: auto;
        }

        .track-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(138, 43, 226, 0.2);
        }

        .track-item-name {
          font-size: 0.8rem;
          color: #ffffff;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-btn {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.5);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: rgba(255, 0, 0, 0.8);
          transform: scale(1.1);
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

          .track-manager {
            max-width: none;
          }

          .auth-modal {
            padding: 1.5rem;
            margin: 1rem;
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

          .control-btn, .upload-btn, .logout-btn {
            width: 30px;
            height: 30px;
          }

          .control-btn svg, .upload-btn svg, .logout-btn svg {
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
