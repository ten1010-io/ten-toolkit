// 데모 재생기. 장면 = 단계 목록, 단계 = 캡션 한 문장 + 동작 목록.
// 동작: move·click(커서) · show·hide · text · add·rm(클래스) · css · grow(막대 칸) · flash · url · wait
// 타임라인은 재생기가 그린다. 화면에 들어오면 저절로 재생하고, 마름모를 누르면 그 단계로 건너뛰고 멈춘다.
// "직접 눌러 보기" 를 누르면 처음 화면에서 멈추고, 다음 단계의 move 대상 위에 깜빡이는 점을 띄운다. 점을 누르면 한 단계씩 진행한다.
(() => {
  const SCENES = JSON.parse(document.getElementById('scenes')?.textContent || '{}')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const pad = n => String(n).padStart(2, '0')
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const ICON = {
    play: '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
    restart: '<svg viewBox="0 0 16 16"><path d="M8 2.5a5.5 5.5 0 1 1-5.2 3.7l1.4.5A4 4 0 1 0 8 4v2L4.5 3.2 8 .5z"/></svg>',
    hand: '<svg viewBox="0 0 16 16"><path d="M6 1.5a1 1 0 0 1 2 0V7h.5V3a1 1 0 0 1 2 0v4h.5V4a1 1 0 0 1 2 0v6.5A4.5 4.5 0 0 1 8.5 15h-1A4.5 4.5 0 0 1 3.4 12.4L1.6 8.7a1 1 0 0 1 1.7-1L5 9.6V1.5z"/></svg>',
  }
  const NAV = { projects: 'Projects', nodes: 'Nodes', 'workload-groups': 'WorkloadGroups', workspaces: 'Workspaces', operations: 'Operations', pvs: 'PVs', pvcs: 'PVCs', 'cluster-volumes': 'ClusterVolumes', 'file-servers': 'FileServers' }
  const TOP = '<b class="app-logo">AIPub <i>Admin</i></b><span class="app-search">⌕ Ctrl + K</span><span class="app-tb">Docs</span><span class="app-tb">System</span>'
  const SIDE = '<aside class="app-side"><span class="bm">Bookmark ▾</span><p>Management</p><span>Dashboard</span><span data-nav="projects">Projects</span><span>Users</span><span data-nav="nodes">Nodes</span><span>Prioritization</span><span>Usage</span><p>Images / Models</p><span>ImageHub</span><p>Workload</p><span>Templates</span><span data-nav="workload-groups">WorkloadGroups</span><span data-nav="workspaces">Workspaces</span><span>Jobs</span><span>CronJobs</span><span>ChainJobs</span><span data-nav="operations">Operations</span><p>Storage</p><span data-nav="pvs">PVs</span><span data-nav="pvcs">PVCs</span><span data-nav="cluster-volumes">ClusterVolumes</span><span data-nav="file-servers">FileServers</span></aside>'
  // 화면 흉내(.ui.app)를 AIPub 앱 틀(위 막대 + 왼쪽 메뉴 + 경로)로 감싼다
  const buildShell = ui => {
    const body = ui.querySelector(':scope > .ui-body')
    if (!body) return
    const top = document.createElement('div')
    top.className = 'app-top'; top.innerHTML = TOP
    const chrome = ui.querySelector(':scope > .ui-chrome')
    chrome ? chrome.after(top) : ui.prepend(top)
    const wrap = document.createElement('div')
    wrap.className = 'app-wrap'; wrap.innerHTML = SIDE
    body.before(wrap)
    const main = document.createElement('div')
    main.className = 'app-main'; main.innerHTML = '<div class="app-crumb"></div>'
    wrap.appendChild(main); main.appendChild(body)
  }
  const CURSOR = '<div class="cursor" aria-hidden="true"><span class="ring"></span><svg viewBox="0 0 20 20"><path d="M3 2 L3 16 L7 12.5 L9.6 18 L12 17 L9.5 11.6 L15 11.6 Z"/></svg></div>'

  class Player {
    constructor(el) {
      this.el = el
      this.steps = SCENES[el.dataset.scene] || []
      this.stage = el.querySelector('.stage')
      this.mock = el.querySelector('.mock')
      this.mock.querySelectorAll('.ui.app').forEach(buildShell)
      this.initial = this.mock.innerHTML
      this.stage.insertAdjacentHTML('beforeend', CURSOR)
      this.cursor = this.stage.querySelector('.cursor')
      this.hot = document.createElement('button')
      this.hot.type = 'button'
      this.hot.className = 'hot'
      this.hot.hidden = true
      this.hot.innerHTML = '<span class="ring"></span><span class="lbl"></span>'
      this.stage.appendChild(this.hot)
      const n = this.steps.length
      const pct = i => (n > 1 ? (i / (n - 1)) * 100 : 0)
      const tl = el.querySelector('.timeline')
      tl.innerHTML = `<div class="tl-ctl"><button type="button" class="tl-play"></button><button type="button" class="tl-restart" aria-label="처음부터 다시 재생">${ICON.restart}</button><button type="button" class="tl-try" aria-label="직접 눌러 보기">${ICON.hand}<span>직접 눌러 보기</span></button></div>
        <p class="tl-cap" aria-live="polite"><span class="no"></span><span class="tx"></span></p>
        <div class="tl-track"><div class="tl-ruler"></div><div class="tl-base"></div><div class="tl-done"></div><span class="tl-head"></span>
        ${this.steps.map((s, i) => `<button type="button" class="kf" style="left:${pct(i)}%" aria-label="${i + 1}단계로 건너뛰기: ${esc(s.cap)}"></button>`).join('')}</div>`
      this.pct = pct
      this.btn = tl.querySelector('.tl-play')
      this.tryBtn = tl.querySelector('.tl-try')
      this.no = tl.querySelector('.no')
      this.tx = tl.querySelector('.tx')
      this.done = tl.querySelector('.tl-done')
      this.head = tl.querySelector('.tl-head')
      this.kfs = [...tl.querySelectorAll('.kf')]
      this.gen = 0
      this.cur = -1
      this.playing = false
      this.visible = false
      this.trying = false
      this.btn.addEventListener('click', () => (this.playing ? this.pause() : this.play(this.cur + 1 >= n ? 0 : this.cur + 1)))
      tl.querySelector('.tl-restart').addEventListener('click', () => this.play(0))
      this.tryBtn.addEventListener('click', () => (this.trying ? this.rest() : this.tryMode()))
      this.hot.addEventListener('click', () => this.step(this.next))
      this.kfs.forEach((k, i) => k.addEventListener('click', () => { const t = this.trying; this.seek(i); if (t) { this.trying = true; this.setBtn(); this.showHot(i + 1) } }))
      this.setBtn()
    }
    q(k) { return this.mock.querySelector(`[data-k="${k}"]`) }
    // 주소창을 바꾸면 왼쪽 메뉴와 경로도 따라 바꾼다
    syncUrl(u) {
      const el = this.q('url')
      if (el) el.textContent = u
      const seg = u.split('?')[0].split('/').filter(Boolean)
      this.mock.querySelectorAll('[data-nav]').forEach(n => n.classList.toggle('on', n.dataset.nav === seg[0]))
      const c = this.mock.querySelector('.app-crumb')
      if (c) c.innerHTML = seg.map((x, i) => (i === 0 ? NAV[x] || x : x === 'create' ? 'Create' : x === 'edit' ? 'Edit' : `<b>${esc(x)}</b>`)).join('<i>›</i>')
    }
    setBtn() {
      this.btn.innerHTML = this.playing ? ICON.pause : ICON.play
      this.btn.setAttribute('aria-label', this.playing ? '일시정지' : '재생')
      this.el.classList.toggle('paused', !this.playing)
      this.tryBtn.classList.toggle('on', this.trying)
      this.tryBtn.setAttribute('aria-pressed', String(this.trying))
      if (!this.trying) { this.hot.hidden = true; this.kfs.forEach(k => k.classList.remove('next')) }
    }
    reset() {
      this.stage.querySelectorAll('.flash-ring').forEach(r => r.remove())
      this.mock.innerHTML = this.initial
      const u = this.q('url')
      if (u) this.syncUrl(u.textContent)
      this.cursor.style.transform = 'translate(24px, 24px)'
      this.el.classList.add('snap')
      this.mark(-1)
      void this.el.offsetWidth
      this.el.classList.remove('snap')
    }
    mark(i) {
      this.cur = i
      this.kfs.forEach((k, j) => { k.classList.toggle('on', j <= i); k.classList.toggle('cur', j === i) })
      const p = i < 0 ? 0 : this.pct(i)
      this.done.style.width = `${p}%`
      this.head.style.left = `${p}%`
      const s = this.steps[i]
      this.no.textContent = i < 0 ? '' : `${pad(i + 1)} / ${pad(this.steps.length)}`
      this.tx.textContent = s ? s.cap : ''
    }
    at(el) {
      const s = this.stage.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return [r.left - s.left + Math.min(r.width / 2, 40), r.top - s.top + r.height / 2]
    }
    // 강조는 대상 위에 같은 크기의 상자를 무대에 겹쳐 그린다. 대상에 직접 그리면 표 행(tr)이나 overflow 안쪽에서 잘린다
    ring(el) {
      if (el.closest('[hidden]')) return
      const s = this.stage.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const d = document.createElement('span')
      d.className = 'flash-ring'
      Object.assign(d.style, { left: `${r.left - s.left}px`, top: `${r.top - s.top}px`, width: `${r.width}px`, height: `${r.height}px` })
      const br = getComputedStyle(el).borderRadius
      if (br !== '0px') d.style.borderRadius = br
      d.addEventListener('animationend', () => d.remove())
      this.stage.appendChild(d)
    }
    point(el) {
      if (!el || el.closest('[hidden]')) return
      const [x, y] = this.at(el)
      this.cursor.style.transform = `translate(${x}px, ${y}px)`
    }
    async act([op, k, v, w], fast) {
      if (op === 'wait') return fast ? null : sleep(k)
      if (op === 'url') { this.syncUrl(k); return }
      const el = this.q(k)
      if (!el) return
      if (op === 'move') { if (fast) return; this.point(el); return sleep(680) }
      if (op === 'click') {
        if (fast) return
        this.cursor.classList.remove('click'); void this.cursor.offsetWidth; this.cursor.classList.add('click')
        return sleep(260)
      }
      if (op === 'show') { el.hidden = false; if (!fast) el.classList.add('appear') }
      if (op === 'hide') el.hidden = true
      if (op === 'text') el.textContent = v
      if (op === 'add') el.classList.add(v)
      if (op === 'rm') el.classList.remove(v)
      if (op === 'css') el.style[v] = w
      if (op === 'grow') el.style.flexGrow = String(v)
      if (op === 'flash' && !fast) this.ring(el)
    }
    // 0..i 단계를 바로 적용하고 그 단계의 마지막 커서 위치에 멈춘다
    apply(i) {
      this.reset()
      let last = null
      for (let j = 0; j <= i; j++) for (const a of this.steps[j].acts) { this.act(a, true); if (a[0] === 'move') last = a[1] }
      this.mark(i)
      this.point(last && this.q(last))
    }
    async play(from = 0) {
      const gen = ++this.gen
      this.playing = true; this.held = false; this.trying = false; this.setBtn()
      if (from === 0) this.reset(); else this.apply(from - 1)
      for (let i = from; i < this.steps.length; i++) {
        if (gen !== this.gen) return
        this.mark(i)
        for (const a of this.steps[i].acts) { if (gen !== this.gen) return; await this.act(a, false) }
        await sleep(1500)
      }
      // 모달을 열 때 한 번만 재생하고 마지막 장면에 멈춘다
      if (gen === this.gen) { this.playing = false; this.held = true; this.setBtn() }
    }
    // held: 사용자가 멈추거나 단계를 고르면 다시 화면에 들어와도 저절로 재생하지 않는다
    pause() { this.gen++; this.playing = false; this.held = true; this.setBtn() }
    seek(i, held = true) { this.gen++; this.playing = false; this.trying = false; this.held = held; this.setBtn(); this.apply(i) }
    rest() { this.seek(this.steps.length - 1, false) }
    open() { return !!this.el.closest('dialog')?.open }
    tryMode() {
      this.gen++; this.playing = false; this.held = true; this.trying = true; this.setBtn()
      this.reset()
      this.showHot(0)
    }
    showHot(i) {
      this.next = i
      const n = this.steps.length
      this.kfs.forEach((k, j) => k.classList.toggle('next', j === i))
      if (i >= n) {
        this.trying = false; this.setBtn()
        this.no.textContent = `${pad(n)} / ${pad(n)}`
        this.tx.textContent = '끝까지 눌러 봤습니다. 손 모양 버튼을 다시 누르면 처음부터 해 볼 수 있습니다.'
        return
      }
      const key = (this.steps[i].acts.find(a => a[0] === 'move') || [])[1]
      const el = key && this.q(key)
      const lbl = this.hot.querySelector('.lbl')
      const free = !(el && !el.closest('[hidden]'))
      this.hot.classList.toggle('free', free)
      if (!free) {
        const [x, y] = this.at(el)
        this.hot.style.left = `${x}px`; this.hot.style.top = `${y}px`
        lbl.textContent = '여기를 눌러 보세요'
      } else {
        // 누를 화면 요소가 없는 단계는 점 대신 "다음 단계" 버튼을 띄운다
        this.hot.style.left = '50%'; this.hot.style.top = `${this.stage.clientHeight - 64}px`
        lbl.textContent = '다음 단계 ▶'
      }
      this.hot.hidden = false
      this.no.textContent = `다음 ${pad(i + 1)}`
      this.tx.textContent = this.steps[i].cap
    }
    async step(i) {
      const gen = ++this.gen
      this.hot.hidden = true
      this.mark(i)
      for (const a of this.steps[i].acts) { if (gen !== this.gen) return; await this.act(a, false) }
      // 막 나타난 팝업·대화상자의 등장 애니메이션(.35초)이 끝난 뒤 위치를 잰다
      await sleep(420)
      if (gen === this.gen && this.trying) this.showHot(i + 1)
    }
  }

  const players = new Map()
  document.querySelectorAll('.player').forEach(el => { const p = new Player(el); players.set(el, p); p.rest() })
  // 2층은 모달로 연다. 열면 처음부터 재생하고, 닫으면 마지막 장면에 멈춘다
  document.querySelectorAll('.l2btn').forEach(btn => btn.addEventListener('click', () => {
    const dlg = document.getElementById(btn.getAttribute('aria-controls'))
    dlg.showModal()
    const pl = dlg.querySelector('.player')
    if (!pl) return
    const p = players.get(pl)
    p.held = false
    requestAnimationFrame(() => (reduce ? p.rest() : p.play(0)))
  }))
  document.querySelectorAll('dialog.modal').forEach(d => {
    d.addEventListener('close', () => { const pl = d.querySelector('.player'); if (pl) players.get(pl).rest() })
    d.addEventListener('click', e => { if (e.target === d) d.close() })
    d.querySelector('.m-close').addEventListener('click', () => d.close())
  })
})()

// 목차와 점 막대: 지나온 칸을 칠한다. 이 브라우저에만 저장한다
;(() => {
  const KEY = 'ib2-seen'
  let seen = new Set()
  try { seen = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...seen])) } catch {} }
  const stops = [...document.querySelectorAll('[data-stop]')]
  const gos = [...document.querySelectorAll('[data-go]')]
  const paint = here => gos.forEach(b => { b.classList.toggle('seen', seen.has(b.dataset.go)); if (here) b.classList.toggle('here', b.dataset.go === here) })
  // 화면 위에서 40% 지점을 지난 마지막 칸이 지금 칸이다. 누른 칸은 스크롤이 끝나기 전에 바로 표시한다
  let lock = null
  const current = () => {
    const y = innerHeight * 0.4
    let here = stops[0].id
    for (const st of stops) if (st.getBoundingClientRect().top <= y) here = st.id
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) here = stops[stops.length - 1].id
    return here
  }
  let raf = 0
  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const here = lock || current()
      seen.add(here); save(); paint(here)
    })
  }
  gos.forEach(b => b.addEventListener('click', () => {
    lock = b.dataset.go
    clearTimeout(b._t); b._t = setTimeout(() => { lock = null; onScroll() }, 900)
    document.getElementById(lock)?.scrollIntoView({ block: 'start' })
    onScroll()
  }))
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})()

// 화면 테마: 자동(기기 설정) → 라이트 → 다크. 이 브라우저에만 저장한다
;(() => {
  const b = document.getElementById('theme')
  const order = ['system', 'light', 'dark']
  const label = { system: '자동', light: '라이트', dark: '다크' }
  let t = 'system'
  try { t = localStorage.getItem('ib2-theme') || 'system' } catch {}
  const apply = () => {
    if (t === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = t
    b.querySelector('span').textContent = label[t]
    b.setAttribute('aria-label', `화면 테마 ${label[t]}, 눌러서 바꾸기`)
  }
  b.addEventListener('click', () => { t = order[(order.indexOf(t) + 1) % 3]; try { localStorage.setItem('ib2-theme', t) } catch {} ; apply() })
  apply()
})()

// 값 바꿔 보기: .try[data-let] 안에서 스테퍼·체크박스·선택 상자 값으로 식을 계산해 data-text·data-grow·data-if·data-cls·data-slots 를 그린다
;(() => {
  document.querySelectorAll('.try').forEach(box => {
    const vars = {}
    const calc = expr => { try { return Function(...Object.keys(vars), 'Math', `return (${expr})`)(...Object.values(vars), Math) } catch { return '' } }
    const lets = (box.dataset.let || '').split(';').map(x => x.trim()).filter(Boolean).map(x => [x.slice(0, x.indexOf('=')).trim(), x.slice(x.indexOf('=') + 1)])
    const render = () => {
      for (const [k, e] of lets) vars[k] = calc(e)
      box.querySelectorAll('.stp').forEach(s => {
        const v = vars[s.dataset.var]
        s.querySelector('output').textContent = v
        s.querySelector('[data-d="-1"]').disabled = v <= +s.dataset.min
        s.querySelector('[data-d="1"]').disabled = v >= +s.dataset.max
      })
      box.querySelectorAll('[data-text]').forEach(el => { el.textContent = calc(el.dataset.text) })
      box.querySelectorAll('[data-grow]').forEach(el => { const g = Math.max(0, +calc(el.dataset.grow) || 0); el.style.flexGrow = String(g); el.textContent = g ? g : '' })
      box.querySelectorAll('[data-if]').forEach(el => { el.hidden = !calc(el.dataset.if) })
      box.querySelectorAll('[data-cls]').forEach(el => el.dataset.cls.split(';').forEach(pair => { const i = pair.indexOf(':'); el.classList.toggle(pair.slice(0, i).trim(), !!calc(pair.slice(i + 1))) }))
      box.querySelectorAll('[data-slots]').forEach(el => {
        const [total, on] = el.dataset.slots.split(':').map(calc)
        el.innerHTML = Array.from({ length: +total || 0 }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')
      })
    }
    box.querySelectorAll('.stp').forEach(s => {
      vars[s.dataset.var] = +s.dataset.val
      const name = s.getAttribute('aria-label') || s.dataset.var
      s.innerHTML = `<button type="button" data-d="-1" aria-label="${name} 줄이기">−</button><output aria-live="polite"></output><button type="button" data-d="1" aria-label="${name} 늘리기">+</button>`
      s.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return
        vars[s.dataset.var] = Math.min(+s.dataset.max, Math.max(+s.dataset.min, vars[s.dataset.var] + +b.dataset.d))
        render()
      })
    })
    box.querySelectorAll('input[type=checkbox][data-var]').forEach(c => { vars[c.dataset.var] = c.checked ? 1 : 0; c.addEventListener('change', () => { vars[c.dataset.var] = c.checked ? 1 : 0; render() }) })
    box.querySelectorAll('select[data-var]').forEach(c => { vars[c.dataset.var] = +c.value; c.addEventListener('change', () => { vars[c.dataset.var] = +c.value; render() }) })
    render()
  })
})()
