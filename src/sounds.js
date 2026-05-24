let ctx = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    const resume = () => { ctx.resume(); document.removeEventListener('click', resume) }
    document.addEventListener('click', resume)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, dur, { type = 'sine', vol = 0.15, attack = 0.005, delay = 0 } = {}) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.connect(g)
  g.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay)
  g.gain.setValueAtTime(0, ac.currentTime + delay)
  g.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + dur)
  osc.start(ac.currentTime + delay)
  osc.stop(ac.currentTime + delay + dur + 0.05)
}

function sweep(f1, f2, dur, { type = 'sine', vol = 0.15, attack = 0.004, delay = 0 } = {}) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.connect(g)
  g.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(f1, ac.currentTime + delay)
  osc.frequency.exponentialRampToValueAtTime(f2, ac.currentTime + delay + dur)
  g.gain.setValueAtTime(0, ac.currentTime + delay)
  g.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + dur)
  osc.start(ac.currentTime + delay)
  osc.stop(ac.currentTime + delay + dur + 0.05)
}

export const sounds = {
  // tick — clique ultra curto, como cursor piscando
  tick(n) {
    tone(n === 1 ? 1100 : 880, 0.035, { type: 'triangle', vol: 0.11, attack: 0.002 })
  },

  // go — dois pops suaves indicando "pode escolher"
  go() {
    tone(660,  0.06, { type: 'triangle', vol: 0.14, attack: 0.004 })
    tone(1046, 0.08, { type: 'triangle', vol: 0.16, attack: 0.004, delay: 0.07 })
  },

  // confirm — pop descendente limpo
  confirm() {
    sweep(780, 480, 0.09, { type: 'triangle', vol: 0.18, attack: 0.003 })
  },

  // score — resposta proporcional à pontuação, sons curtos
  score(s) {
    if (s >= 95) {
      // perfeito — dois tiques rápidos subindo
      tone(880,  0.09, { type: 'triangle', vol: 0.16, attack: 0.004 })
      tone(1320, 0.11, { type: 'triangle', vol: 0.14, attack: 0.004, delay: 0.09 })
    } else if (s >= 75) {
      // bom — um tom limpo
      tone(1046, 0.1, { type: 'triangle', vol: 0.15, attack: 0.005 })
    } else if (s >= 55) {
      // ok — tom neutro
      tone(660, 0.1, { type: 'sine', vol: 0.13, attack: 0.008 })
    } else {
      // errou — dois tons descendo, discretos
      tone(440, 0.09, { type: 'sine', vol: 0.13, attack: 0.008 })
      tone(330, 0.11, { type: 'sine', vol: 0.11, attack: 0.008, delay: 0.1 })
    }
  },

  // results — sequência suave de 3 notas
  results() {
    ;[660, 880, 1046].forEach((f, i) =>
      tone(f, 0.09, { type: 'triangle', vol: 0.14, attack: 0.004, delay: i * 0.1 })
    )
  },
}
