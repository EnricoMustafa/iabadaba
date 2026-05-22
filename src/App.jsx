import { useState, useEffect, useRef } from 'react'
import { sounds } from './sounds.js'

// ─── color helpers ──────────────────────────────────────────────────────────

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

function calcScore(t, g) {
  const [r1, g1, b1] = hslToRgb(t.h, t.s, t.l)
  const [r2, g2, b2] = hslToRgb(g.h, g.s, g.l)
  const d = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
  return Math.round((1 - d / Math.sqrt(3 * 255 * 255)) * 100)
}

function randColor() {
  return {
    h: Math.floor(Math.random() * 360),
    s: Math.floor(10 + Math.random() * 80),
    l: Math.floor(20 + Math.random() * 60),
  }
}

function hsl({ h, s, l }) {
  return `hsl(${h},${s}%,${l}%)`
}

const ROUNDS = 5
const COUNTDOWN = 5

// ─── Slider ─────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, onChange, gradient }) {
  const pct = ((value - min) / (max - min)) * 100
  const thumbOffset = 12 - pct * 0.24
  const lastSound = useRef(0)

  function handleChange(e) {
    const v = Number(e.target.value)
    onChange(v)
    const now = Date.now()
    if (now - lastSound.current > 80) {
      sounds.slide()
      lastSound.current = now
    }
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-2.5">
        <span className="text-white/60 font-medium tracking-wide">{label}</span>
        <span className="text-white/40 tabular-nums w-8 text-right font-mono text-xs">{value}</span>
      </div>
      <div className="relative h-7 flex items-center select-none">
        <div
          className="absolute inset-x-0 h-[3px] rounded-full"
          style={{ background: gradient }}
        />
        <div
          className="absolute w-5 h-5 rounded-full bg-white shadow-lg pointer-events-none ring-1 ring-black/20"
          style={{
            left: `calc(${pct}% + ${thumbOffset}px)`,
            transform: 'translateX(-50%)',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

// ─── ScoreBadge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  useEffect(() => { sounds.score(score) }, [])

  const msg =
    score >= 90 ? 'Incrível!' :
    score >= 75 ? 'Muito bom!' :
    score >= 55 ? 'Bom trabalho!' :
                  'Continue praticando!'

  return (
    <div className="text-center">
      <div className="text-7xl font-black tabular-nums text-white tracking-tighter">{score}</div>
      <div className="text-white/30 text-xs uppercase tracking-[0.2em] mt-1 mb-1 font-medium">pontos</div>
      <div className="text-white/70 text-base font-medium">{msg}</div>
    </div>
  )
}

// ─── RoundDots ───────────────────────────────────────────────────────────────

function RoundDots({ current }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: ROUNDS }, (_, i) => (
        <div
          key={i}
          className={`h-[3px] rounded-full transition-all duration-300 ${
            i < current - 1
              ? 'bg-white w-7'
              : i === current - 1
              ? 'bg-white w-7'
              : 'bg-white/20 w-5'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Results screen ──────────────────────────────────────────────────────────

function ResultsScreen({ history, onRestart }) {
  useEffect(() => { sounds.results() }, [])
  const total = history.reduce((a, r) => a + r.score, 0)
  const avg = Math.round(total / history.length)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8">
      <GitHubBadge />
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-1">iabadaba</h1>
        <p className="text-white/30 text-sm tracking-[0.2em] uppercase font-medium">resultados finais</p>
      </div>

      <div className="w-full max-w-md space-y-2 mb-8">
        {history.map((r, i) => (
          <div key={i} className="border border-white/8 rounded-2xl p-4 flex items-center gap-4 bg-white/[0.02]">
            <span className="text-white/30 text-xs uppercase tracking-wider w-16 shrink-0 font-medium">
              #{i + 1}
            </span>
            <div className="flex gap-2 flex-1 min-w-0">
              <div className="flex-1">
                <p className="text-[10px] text-white/25 mb-1.5 text-center uppercase tracking-widest">Alvo</p>
                <div className="h-12 rounded-xl" style={{ background: hsl(r.target) }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-white/25 mb-1.5 text-center uppercase tracking-widest">Palpite</p>
                <div className="h-12 rounded-xl" style={{ background: hsl(r.guess) }} />
              </div>
            </div>
            <div className="text-right shrink-0 w-10">
              <span className="text-xl font-black tabular-nums">{r.score}</span>
              <p className="text-[10px] text-white/25 uppercase tracking-widest">pts</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-2xl p-6 w-full max-w-md mb-8 text-center bg-white/[0.02]">
        <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-2 font-medium">pontuação total</p>
        <p className="text-6xl font-black tabular-nums tracking-tighter mb-2">{total}</p>
        <p className="text-white/30 text-sm">
          média{' '}
          <span className="text-white font-semibold">{avg}</span>
          /100 por rodada
        </p>
      </div>

      <button
        onClick={onRestart}
        className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm tracking-wide uppercase"
      >
        Jogar novamente
      </button>
    </div>
  )
}

// ─── GitHub badge ────────────────────────────────────────────────────────────

function GitHubBadge() {
  return (
    <a
      href="https://github.com/EnricoMustafa"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200 z-50 group"
    >
      <span className="text-xs font-medium tracking-wide group-hover:text-white/70 transition-colors">
        by: EnricoMustafa
      </span>
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-current"
        aria-hidden="true"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    </a>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────

const DEFAULT_GUESS = { h: 180, s: 50, l: 50 }

export default function App() {
  const [phase, setPhase] = useState('start')
  const [round, setRound] = useState(1)
  const [target, setTarget] = useState(randColor)
  const [guess, setGuess] = useState(DEFAULT_GUESS)
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (phase !== 'showing') return
    if (countdown === 0) {
      sounds.go()
      setPhase('guessing')
      return
    }
    sounds.tick(countdown)
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, countdown])

  function handleConfirm() {
    sounds.confirm()
    const score = calcScore(target, guess)
    setHistory(h => [...h, { target: { ...target }, guess: { ...guess }, score }])
    setPhase('reveal')
  }

  function handleNext() {
    if (round >= ROUNDS) {
      setPhase('results')
    } else {
      setRound(r => r + 1)
      setTarget(randColor())
      setGuess(DEFAULT_GUESS)
      setCountdown(COUNTDOWN)
      setPhase('showing')
    }
  }

  function handleStart() {
    setPhase('showing')
  }

  function handleRestart() {
    setPhase('start')
    setRound(1)
    setTarget(randColor())
    setGuess(DEFAULT_GUESS)
    setCountdown(COUNTDOWN)
    setHistory([])
  }

  if (phase === 'results') {
    return <ResultsScreen history={history} onRestart={handleRestart} />
  }

  if (phase === 'start') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <GitHubBadge />
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <h1 className="text-6xl font-black tracking-tighter mb-3">iabadaba</h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.25em] font-medium mb-12">
            jogo de memória de cores
          </p>

          <div className="w-full border border-white/8 rounded-2xl p-6 bg-white/[0.02] mb-10 space-y-4 text-left">
            {[
              ['1', 'Memorize a cor exibida na tela'],
              ['2', 'Use os sliders para reproduzi-la de memória'],
              ['3', 'Confirme e veja sua pontuação'],
            ].map(([n, text]) => (
              <div key={n} className="flex items-start gap-4">
                <span className="text-white/20 font-black text-lg tabular-nums leading-none mt-0.5">{n}</span>
                <span className="text-white/50 text-sm leading-relaxed">{text}</span>
              </div>
            ))}
          </div>

          <div className="text-white/20 text-xs uppercase tracking-[0.2em] mb-4 font-medium">
            {ROUNDS} rodadas
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm tracking-wide uppercase"
          >
            Iniciar
          </button>
        </div>
      </div>
    )
  }

  const lastScore = history[history.length - 1]?.score
  const circumference = 2 * Math.PI * 40

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <GitHubBadge />
      <div className="w-full max-w-sm">

        {/* ── header ─────────────────────────────── */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-4">iabadaba</h1>
          <RoundDots current={round} />
          <p className="text-white/25 text-xs mt-3 uppercase tracking-[0.2em] font-medium">
            rodada {round} / {ROUNDS}
          </p>
        </div>

        {/* ── SHOWING ────────────────────────────── */}
        {phase === 'showing' && (
          <div className="flex flex-col items-center">
            <p className="text-white/40 mb-6 text-sm tracking-wide uppercase font-medium">
              Memorize esta cor
            </p>

            <div
              className="w-52 h-52 rounded-3xl mb-10"
              style={{ background: hsl(target) }}
            />

            <div className="relative w-20 h-20">
              <svg className="w-20 h-20" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff14" strokeWidth="5" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - countdown / COUNTDOWN)}
                  style={{ transition: 'stroke-dashoffset 0.85s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-black tabular-nums">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* ── GUESSING ───────────────────────────── */}
        {phase === 'guessing' && (
          <div>
            <p className="text-white/40 mb-6 text-center text-sm uppercase tracking-wide font-medium">
              Reproduza a cor de memória
            </p>

            <div
              className="w-48 h-48 rounded-3xl mx-auto mb-7"
              style={{ background: hsl(guess) }}
            />

            <div className="border border-white/8 rounded-2xl p-5 space-y-6 bg-white/[0.02]">
              <Slider
                label="Matiz"
                value={guess.h}
                min={0} max={360}
                onChange={v => setGuess(g => ({ ...g, h: v }))}
                gradient="linear-gradient(to right,hsl(0,80%,50%),hsl(60,80%,50%),hsl(120,80%,50%),hsl(180,80%,50%),hsl(240,80%,50%),hsl(300,80%,50%),hsl(360,80%,50%))"
              />
              <Slider
                label="Saturação"
                value={guess.s}
                min={0} max={100}
                onChange={v => setGuess(g => ({ ...g, s: v }))}
                gradient={`linear-gradient(to right,hsl(${guess.h},0%,${guess.l}%),hsl(${guess.h},100%,${guess.l}%))`}
              />
              <Slider
                label="Luminosidade"
                value={guess.l}
                min={0} max={100}
                onChange={v => setGuess(g => ({ ...g, l: v }))}
                gradient={`linear-gradient(to right,hsl(${guess.h},${guess.s}%,0%),hsl(${guess.h},${guess.s}%,50%),hsl(${guess.h},${guess.s}%,100%))`}
              />
            </div>

            <button
              onClick={handleConfirm}
              className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm tracking-wide uppercase"
            >
              Confirmar
            </button>
          </div>
        )}

        {/* ── REVEAL ─────────────────────────────── */}
        {phase === 'reveal' && (
          <div className="flex flex-col items-center">
            <p className="text-white/40 mb-6 text-sm uppercase tracking-wide font-medium">
              Comparação
            </p>

            <div className="flex gap-3 w-full mb-10">
              <div className="flex-1">
                <p className="text-[10px] text-white/25 mb-2 text-center uppercase tracking-widest font-medium">
                  Alvo
                </p>
                <div
                  className="h-36 rounded-2xl"
                  style={{ background: hsl(target) }}
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-white/25 mb-2 text-center uppercase tracking-widest font-medium">
                  Palpite
                </p>
                <div
                  className="h-36 rounded-2xl"
                  style={{ background: hsl(guess) }}
                />
              </div>
            </div>

            {lastScore !== undefined && <ScoreBadge score={lastScore} />}

            <button
              onClick={handleNext}
              className="w-full mt-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm tracking-wide uppercase"
            >
              {round >= ROUNDS ? 'Ver resultados' : 'Próxima rodada'}
            </button>
          </div>
        )}

      </div>
      
    </div>
  )
}
