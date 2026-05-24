import { useState, useEffect } from 'react'
import { sounds } from './sounds.js'

// ─── color helpers ───────────────────────────────────────────────────────────

function hslToRgb(h, s, l) {
  s /= 100; l /= 100
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

function hsl({ h, s, l }) { return `hsl(${h},${s}%,${l}%)` }

function generateOptions(target) {
  const variants = [
    { h: (target.h + 20) % 360,       s: target.s,                               l: target.l },
    { h: (target.h - 20 + 360) % 360, s: target.s,                               l: target.l },
    { h: (target.h + 40) % 360,       s: target.s,                               l: target.l },
    { h: (target.h - 40 + 360) % 360, s: target.s,                               l: target.l },
    { h: target.h, s: Math.min(90, Math.max(10, target.s + 22)), l: Math.min(80, Math.max(20, target.l - 18)) },
  ]
  const all = [target, ...variants]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}

const ROUNDS = 5
const COUNTDOWN = 5
const CHOICE_COUNTDOWN = 5

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, urgent }) {
  return (
    <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: '#e8e8e8' }}>
      <div
        className="h-full rounded-full transition-[width] ease-linear duration-[1000ms]"
        style={{
          width: `${(value / max) * 100}%`,
          background: urgent ? '#aaa' : '#0a0a0a',
        }}
      />
    </div>
  )
}

// ─── ScoreBadge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  useEffect(() => { sounds.score(score) }, [])

  const msg =
    score >= 95 ? 'Perfeito.' :
    score >= 75 ? 'Muito bom.' :
    score >= 55 ? 'Bom trabalho.' :
                  'Continue praticando.'

  return (
    <div className="w-full border-t pt-5 text-center" style={{ borderColor: '#ebebeb' }}>
      <span className="font-mono text-[68px] font-black tabular-nums leading-none" style={{ color: '#0a0a0a' }}>
        {score}
      </span>
      <p className="text-[10px] uppercase tracking-[0.25em] font-medium mt-1" style={{ color: '#777' }}>
        pontos
      </p>
      <p className="text-sm mt-2" style={{ color: '#555' }}>{msg}</p>
    </div>
  )
}

// ─── GitHub badge ─────────────────────────────────────────────────────────────

function GitHubBadge() {
  return (
    <a
      href="https://github.com/EnricoMustafa/iabadaba"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="fixed top-5 right-5 z-50 transition-opacity duration-200 hover:opacity-50"
      style={{ color: '#000' }}
    >
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    </a>
  )
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ history, onRestart }) {
  useEffect(() => { sounds.results() }, [])
  const total = history.reduce((a, r) => a + r.score, 0)
  const avg = Math.round(total / history.length)

  return (
    <div className="h-dvh flex flex-col items-center px-6 py-8 overflow-y-auto" style={{ background: '#fafafa' }}>
      <GitHubBadge />
      <div className="w-full max-w-sm flex flex-col flex-1">

        <div className="mb-10 pt-2">
          <h1 className="text-xl font-black tracking-tight" style={{ color: '#0a0a0a' }}>iabadaba</h1>
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mt-1" style={{ color: '#666' }}>
            resultados finais
          </p>
        </div>

        <div className="mb-10">
          {history.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-4"
              style={{ borderBottom: '1px solid #f0f0f0' }}
            >
              <span className="font-mono text-[10px] tabular-nums w-5 shrink-0" style={{ color: '#888' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex gap-1.5 flex-1 min-w-0">
                <div
                  className="flex-1 h-9 rounded-[4px]"
                  style={{ background: hsl(r.target), border: '1px solid rgba(0,0,0,0.05)' }}
                />
                <div
                  className="flex-1 h-9 rounded-[4px]"
                  style={{ background: hsl(r.guess), border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </div>
              <span className="font-mono text-sm font-black tabular-nums text-right w-8 shrink-0" style={{ color: '#0a0a0a' }}>
                {r.score}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-8 mb-12" style={{ borderTop: '1px solid #ebebeb' }}>
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-3" style={{ color: '#666' }}>
            Pontuação total
          </p>
          <p className="font-mono text-[80px] font-black tabular-nums leading-none" style={{ color: '#0a0a0a' }}>
            {total}
          </p>
          <p className="text-xs mt-3" style={{ color: '#888' }}>
            média{' '}
            <span className="font-semibold" style={{ color: '#333' }}>{avg}</span>
            /100 por rodada
          </p>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 text-sm font-semibold rounded-lg active:scale-[0.98] transition-all"
          style={{ background: '#0a0a0a', color: '#fff' }}
        >
          Jogar novamente
        </button>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const DEFAULT_GUESS = { h: 180, s: 50, l: 50 }

export default function App() {
  const [phase, setPhase]                     = useState('start')
  const [round, setRound]                     = useState(1)
  const [target, setTarget]                   = useState(randColor)
  const [guess, setGuess]                     = useState(DEFAULT_GUESS)
  const [countdown, setCountdown]             = useState(COUNTDOWN)
  const [choiceCountdown, setChoiceCountdown] = useState(CHOICE_COUNTDOWN)
  const [options, setOptions]                 = useState([])
  const [history, setHistory]                 = useState([])
  const [deco]                                = useState(() => [randColor(), randColor(), randColor(), randColor(), randColor(), randColor()])

  useEffect(() => {
    if (phase !== 'showing') return
    if (countdown === 0) {
      sounds.go()
      setChoiceCountdown(CHOICE_COUNTDOWN)
      setPhase('guessing')
      return
    }
    sounds.tick(countdown)
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'guessing') return
    if (choiceCountdown === 0) {
      const worst = options.reduce((acc, opt) =>
        calcScore(target, opt) < calcScore(target, acc) ? opt : acc
      , options[0])
      sounds.confirm()
      const score = calcScore(target, worst)
      setGuess({ ...worst })
      setHistory(h => [...h, { target: { ...target }, guess: { ...worst }, score }])
      setPhase('reveal')
      return
    }
    sounds.tick(choiceCountdown)
    const id = setTimeout(() => setChoiceCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, choiceCountdown, options, target])

  function handleOptionSelect(option) {
    sounds.confirm()
    const score = calcScore(target, option)
    setGuess({ ...option })
    setHistory(h => [...h, { target: { ...target }, guess: { ...option }, score }])
    setPhase('reveal')
  }

  function handleNext() {
    if (round >= ROUNDS) {
      setPhase('results')
    } else {
      const newTarget = randColor()
      setRound(r => r + 1)
      setTarget(newTarget)
      setGuess(DEFAULT_GUESS)
      setCountdown(COUNTDOWN)
      setChoiceCountdown(CHOICE_COUNTDOWN)
      setOptions(generateOptions(newTarget))
      setPhase('showing')
    }
  }

  function handleStart() {
    setOptions(generateOptions(target))
    setChoiceCountdown(CHOICE_COUNTDOWN)
    setPhase('showing')
  }

  function handleRestart() {
    const newTarget = randColor()
    setPhase('start')
    setRound(1)
    setTarget(newTarget)
    setGuess(DEFAULT_GUESS)
    setCountdown(COUNTDOWN)
    setChoiceCountdown(CHOICE_COUNTDOWN)
    setOptions(generateOptions(newTarget))
    setHistory([])
  }

  if (phase === 'results') {
    return <ResultsScreen history={history} onRestart={handleRestart} />
  }

  // ── Start ────────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div
        className="h-dvh flex flex-col items-center justify-center px-6"
        style={{ background: '#fafafa' }}
      >
        <GitHubBadge />
        <div className="w-full max-w-sm">

          <div className="mb-12">
            <h1
              className="text-8xl font-black tracking-tighter leading-none mb-5"
              style={{ color: '#0a0a0a' }}
            >
              iabadaba
            </h1>
            {/* swatches decorativos */}
            <div className="flex gap-1.5">
              {deco.map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-[3px]"
                  style={{ background: hsl(c), border: '1px solid rgba(0,0,0,0.06)' }}
                />
              ))}
            </div>
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.25em] font-medium mb-10"
            style={{ color: '#666' }}
          >
            Jogo de memória de cores
          </p>

          <div className="mb-10">
            {[
              ['01', 'Memorize a cor exibida na tela'],
              ['02', 'Escolha entre 6 tons qual era a cor original'],
              ['03', 'Você tem 5 segundos para decidir'],
            ].map(([n, text], idx, arr) => (
              <div
                key={n}
                className="flex gap-5 items-start py-4"
                style={idx < arr.length - 1 ? { borderBottom: '1px solid #f0f0f0' } : {}}
              >
                <span className="font-mono text-[10px] tabular-nums mt-0.5 shrink-0" style={{ color: '#aaa' }}>
                  {n}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#333' }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              {Array.from({ length: ROUNDS }, (_, i) => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ background: '#bbb' }} />
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#888' }}>
              {ROUNDS} rodadas
            </span>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 text-sm font-semibold rounded-lg active:scale-[0.98] transition-all"
            style={{ background: '#0a0a0a', color: '#fff' }}
          >
            Iniciar
          </button>
        </div>
      </div>
    )
  }

  // ── Game ─────────────────────────────────────────────────────────────────
  const lastScore = history[history.length - 1]?.score

  return (
    <div
      className="h-dvh flex flex-col px-6"
      style={{ background: '#fafafa' }}
    >
      <GitHubBadge />

      {/* ── header fixo no topo ── */}
      <div className="w-full max-w-sm mx-auto shrink-0 pt-8 pb-5">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-base font-black tracking-tight" style={{ color: '#0a0a0a' }}>
            iabadaba
          </h1>
          <span className="font-mono text-[10px] tabular-nums" style={{ color: '#888' }}>
            {String(round).padStart(2, '0')} / {String(ROUNDS).padStart(2, '0')}
          </span>
        </div>
        <ProgressBar value={round} max={ROUNDS} />
      </div>

      {/* ── conteúdo centralizado no espaço restante ── */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center pb-8">

        {/* ── SHOWING ─────────────────────────────── */}
        {phase === 'showing' && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-4" style={{ color: '#555' }}>
              Memorize
            </p>

            <div
              className="w-full rounded-lg mb-6"
              style={{
                background: hsl(target),
                aspectRatio: '4/3',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            />

            <div className="flex items-center gap-4">
              <ProgressBar value={countdown} max={COUNTDOWN} />
              <span className="font-mono text-[11px] tabular-nums shrink-0 w-3 text-right" style={{ color: '#888' }}>
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* ── GUESSING ────────────────────────────── */}
        {phase === 'guessing' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: '#555' }}>
                Qual era a cor?
              </p>
              <span
                className="font-mono text-[11px] tabular-nums shrink-0"
                style={{ color: choiceCountdown <= 5 ? '#666' : '#888' }}
              >
                {String(choiceCountdown).padStart(2, '0')}
              </span>
            </div>

            <div className="mb-5">
              <ProgressBar value={choiceCountdown} max={CHOICE_COUNTDOWN} urgent={choiceCountdown <= 5} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opt)}
                  className="aspect-square rounded-md hover:scale-[1.02] active:scale-[0.96] transition-transform duration-100"
                  style={{
                    background: hsl(opt),
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── REVEAL ──────────────────────────────── */}
        {phase === 'reveal' && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-4" style={{ color: '#555' }}>
              Comparação
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: '#777' }}>
                  Alvo
                </p>
                <div
                  className="w-full rounded-md"
                  style={{ background: hsl(target), height: '110px', border: '1px solid rgba(0,0,0,0.06)' }}
                />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: '#777' }}>
                  Palpite
                </p>
                <div
                  className="w-full rounded-md"
                  style={{ background: hsl(guess), height: '110px', border: '1px solid rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>

            {lastScore !== undefined && <ScoreBadge score={lastScore} />}

            <button
              onClick={handleNext}
              className="w-full mt-5 py-3.5 text-sm font-semibold rounded-lg active:scale-[0.98] transition-all"
              style={{ background: '#0a0a0a', color: '#fff' }}
            >
              {round >= ROUNDS ? 'Ver resultados' : 'Próxima rodada'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
