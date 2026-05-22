let ctx = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    // resume on first user gesture so autoplay policy doesn't block us
    const resume = () => { ctx.resume(); document.removeEventListener('click', resume) }
    document.addEventListener('click', resume)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, dur, { type = 'sine', vol = 0.28, attack = 0.01, delay = 0 } = {}) {
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

// C4=261, D4=293, E4=329, F4=349, G4=392, A4=440, B4=493
// C5=523, D5=587, E5=659, G5=784, A5=880, C6=1047

export const sounds = {
  // countdown tick — short high beep
  tick(n) {
    const freq = n === 1 ? 1100 : 880
    tone(freq, 0.07, { vol: 0.18 })
  },

  // transition to guessing phase
  go() {
    tone(659, 0.12, { vol: 0.25 })
    tone(880, 0.18, { vol: 0.3, delay: 0.1 })
  },

  // slider drag — subtle micro-click
  slide() {
    tone(1200, 0.04, { vol: 0.06, type: 'triangle' })
  },

  // confirm button press
  confirm() {
    tone(440, 0.08, { vol: 0.22, type: 'triangle' })
    tone(587, 0.1, { vol: 0.22, type: 'triangle', delay: 0.07 })
  },

  // reveal score based on result
  score(s) {
    if (s >= 90) {
      // triumphant 4-note
      ;[523, 659, 784, 1047].forEach((f, i) =>
        tone(f, 0.18, { vol: 0.28, delay: i * 0.13 })
      )
    } else if (s >= 75) {
      tone(523, 0.15, { vol: 0.25 })
      tone(659, 0.2, { vol: 0.25, delay: 0.14 })
      tone(784, 0.22, { vol: 0.22, delay: 0.28 })
    } else if (s >= 55) {
      tone(440, 0.15, { vol: 0.22 })
      tone(523, 0.2, { vol: 0.22, delay: 0.15 })
    } else {
      // gentle descending
      tone(392, 0.18, { vol: 0.2 })
      tone(329, 0.25, { vol: 0.18, delay: 0.18 })
    }
  },

  // final results screen
  results() {
    ;[523, 659, 523, 784, 1047].forEach((f, i) =>
      tone(f, 0.15, { vol: 0.22, delay: i * 0.14 })
    )
  },
}
