// ==UserScript==
// @name         Playback Speed Control
// @name:zh-CN   视听调速
// @namespace    https://github.com/asong56/userscript
// @version      3.1.0
// @description  Speed control (0.1x-16x) for any video/audio on any page, including Shadow DOM. Floating panel + hotkeys, always resets to 1x on load.
// @description:zh-CN 为任意网页（含 Shadow DOM）上的 video/audio 调速，悬浮面板 + 快捷键，0.1x-16x，每次加载默认 1x
// @author       asong56
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @noframes
// @license      MIT
// @homepageURL  https://github.com/asong56/userscript
// @supportURL   https://github.com/asong56/userscript/issues
// @downloadURL  https://raw.githubusercontent.com/asong56/userscript/main/playback-speed.user.js
// @updateURL    https://raw.githubusercontent.com/asong56/userscript/main/playback-speed.user.js
// ==/UserScript==

(() => {
  'use strict';

  const CFG = { min: 0.1, max: 16, step: 0.1, big: 1, debounce: 150 };
  const clamp = (v) => Math.min(CFG.max, Math.max(CFG.min, v));
  const fmt = (n) => `${Number.isInteger(n) ? n.toFixed(1) : +n.toFixed(2)}x`;
  const mk = (tag, props) => Object.assign(document.createElement(tag), props);

  // 遍历 root 自身及其 Shadow DOM 收集 video/audio；root 可以是 document，也可以是单个新增节点
  function* mediaEls(root = document) {
    if (root.matches?.('video,audio')) yield root;
    yield* root.querySelectorAll?.('video,audio') ?? [];
    for (const el of root.querySelectorAll?.('*') ?? []) if (el.shadowRoot) yield* mediaEls(el.shadowRoot);
  }

  const CSS = `
    .gs-panel{position:fixed;top:16px;right:16px;z-index:2147483647;display:none;min-width:180px;
      background:rgba(20,20,20,.85);color:#fff;border-radius:10px;padding:10px 12px;user-select:none;
      backdrop-filter:blur(6px);box-shadow:0 4px 16px rgba(0,0,0,.35);
      font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .gs-panel.show{display:block}
    .gs-title{font-weight:600;margin-bottom:6px;opacity:.85}
    .gs-row{display:flex;align-items:center;gap:6px;margin-bottom:6px}
    .gs-label{min-width:52px;text-align:center;font-size:16px;font-weight:700}
    .gs-panel button{background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer}
    .gs-panel button:hover{background:#4a4a4a}
    .gs-btn{width:28px;height:28px;font-size:14px}
    .gs-reset{padding:4px 8px;font-size:12px}
    .gs-slider{width:100%;margin:4px 0}
    .gs-hint{font-size:10px;opacity:.55;margin-top:6px}
  `;

  // 单一数据源：驱动面板按钮 + 快捷键，避免重复定义
  const ACTIONS = [
    { label: '«', title: '大幅减速 (X)', key: 'KeyX', run: (c) => c.change(-CFG.big) },
    { label: '‹', title: '减速 (S)', key: 'KeyS', run: (c) => c.change(-CFG.step) },
    { label: '›', title: '加速 (D)', key: 'KeyD', run: (c) => c.change(CFG.step) },
    { label: '»', title: '大幅加速 (C)', key: 'KeyC', run: (c) => c.change(CFG.big) },
  ];
  const KEYMAP = Object.fromEntries([
    ...ACTIONS.map((a) => [a.key, a.run]),
    ['KeyR', (c) => c.set(1)],
    ['KeyG', (c) => c.panel.toggle()],
  ]);

  const isEditable = (el) => el?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName);

  class SpeedPanel {
    #root;
    constructor(controller) {
      this.c = controller;
    }

    #btn({ label, title, run }, extraClass = 'gs-btn') {
      return mk('button', { textContent: label, title, className: extraClass, onclick: () => run(this.c) });
    }

    #build() {
      document.head.append(mk('style', { textContent: CSS }));

      const label = mk('div', { className: 'gs-label' });
      const [a1, a2, a3, a4] = ACTIONS;
      const row = mk('div', { className: 'gs-row' });
      row.append(this.#btn(a1), this.#btn(a2), label, this.#btn(a3), this.#btn(a4));

      const slider = mk('input', {
        type: 'range', className: 'gs-slider', min: CFG.min, max: CFG.max, step: 0.05,
        value: this.c.speed, oninput: (e) => this.c.set(+e.target.value),
      });
      const resetBtn = this.#btn({ label: '重置 1.0x', title: '', run: () => this.c.set(1) }, 'gs-reset');
      const title = mk('div', { className: 'gs-title', textContent: '播放速度' });
      const hint = mk('div', { className: 'gs-hint', textContent: '快捷键: S/D ±0.1, X/C ±1, R 重置, G 隐藏' });

      this.#root = mk('div', { className: 'gs-panel' });
      this.#root.append(title, row, slider, resetBtn, hint);
      document.documentElement.append(this.#root);
      this.label = label;
      this.slider = slider;
    }

    sync(speed) {
      if (this.label) this.label.textContent = fmt(speed);
      if (this.slider && Math.abs(+this.slider.value - speed) > 0.001) this.slider.value = speed;
    }

    toggle() {
      this.#root ||= (this.#build(), this.#root);
      this.#root.classList.toggle('show');
    }
  }

  class SpeedController {
    speed = 1;
    #hooked = new WeakSet();
    panel = new SpeedPanel(this);

    set(speed) {
      this.speed = clamp(speed);
      for (const m of mediaEls()) {
        try { m.playbackRate = this.speed; } catch { /* DRM 等受限流忽略 */ }
      }
      this.panel.sync(this.speed);
    }

    change(delta) {
      this.set(this.speed + delta);
    }

    // 抗覆盖：网站脚本改回速度时自动纠正
    #hook(m) {
      if (this.#hooked.has(m)) return;
      this.#hooked.add(m);
      const reassert = () => Math.abs(m.playbackRate - this.speed) > 0.001 && (m.playbackRate = this.speed);
      for (const evt of ['ratechange', 'loadedmetadata', 'play']) m.addEventListener(evt, reassert);
      try { m.playbackRate = this.speed; } catch {}
    }

    scan(root) {
      for (const m of mediaEls(root)) this.#hook(m);
    }

    // 只重新扫描新增子树，而不是每次变化都遍历整个文档
    watch() {
      let timer;
      const queue = [];
      new MutationObserver((muts) => {
        for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) queue.push(n);
        if (!queue.length) return;
        clearTimeout(timer);
        timer = setTimeout(() => queue.splice(0).forEach((n) => this.scan(n)), CFG.debounce);
      }).observe(document.documentElement ?? document.body ?? document, { childList: true, subtree: true });
    }

    listenKeys() {
      document.addEventListener('keydown', (e) => {
        if (isEditable(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
        const action = KEYMAP[e.code];
        if (!action) return;
        action(this);
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }

    init() {
      const start = () => { this.watch(); this.scan(document); this.set(1); };
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', start, { once: true })
        : start();
      this.listenKeys();
    }
  }

  new SpeedController().init();
})();
