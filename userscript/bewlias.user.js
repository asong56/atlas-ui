// ==UserScript==
// @name         Bewlias
// @name:zh-CN   Bewlias
// @namespace    https://github.com/asong56/userscript
// @version      0.1.0
// @description  A clean, private, fast, lightweight redesign for Bilibili's homepage.
// @description:zh-CN 纯净、隐私、极速、小体积的 Bilibili 首页重塑
// @author       asong56
// @match        https://www.bilibili.com/*
// @match        https://t.bilibili.com/*
// @match        https://search.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @license      MIT
// @homepageURL  https://github.com/asong56/userscript
// @supportURL   https://github.com/asong56/userscript/issues
// @downloadURL  https://raw.githubusercontent.com/asong56/userscript/main/bewlias.user.js
// @updateURL    https://raw.githubusercontent.com/asong56/userscript/main/bewlias.user.js
// ==/UserScript==

(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // 样式：设计令牌 + 布局 + 各组件样式，合并为一次 GM_addStyle 调用
  // ---------------------------------------------------------------------
  const CSS = `
:host,
:root {
  --bwl-page-max-width: 2280px;
  --bwl-radius: 12px;
  --bwl-radius-half: calc(var(--bwl-radius) / 2);
  --bwl-top-bar-height: 64px;

  --bwl-font-family:
    -apple-system, "SF Pro Display", "SF Pro Text", "Segoe UI", "Segoe UI Variable",
    system-ui, "PingFang SC", "Microsoft YaHei", sans-serif;
  --bwl-base-font-size: 14.8px;

  --bwl-filter-glass: blur(14px) saturate(160%);

  --bwl-shadow-1: 0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --bwl-shadow-2: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.06);
  --bwl-shadow-3: 0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.08);

  --bwl-theme-color: hsl(195 100% 42%);
  --bwl-theme-color-10: color-mix(in oklab, var(--bwl-theme-color), transparent 90%);
  --bwl-theme-color-40: color-mix(in oklab, var(--bwl-theme-color), transparent 60%);
  --bwl-theme-color-80: color-mix(in oklab, var(--bwl-theme-color), transparent 20%);

  --bwl-error-color: hsl(358 75% 59%);

  --bwl-text-1: hsl(220 9% 15%);
  --bwl-text-2: hsl(220 9% 40%);
  --bwl-text-3: hsl(220 9% 60%);

  --bwl-bg-1: hsl(0 0% 100%);
  --bwl-bg-2: hsl(220 20% 97%);
  --bwl-bg-3: hsl(220 20% 93%);

  --bwl-dock-width: 64px;
  --bwl-dock-width-collapsed: 12px;
}

:host-context(.dark),
:root.dark {
  --bwl-text-1: hsl(220 14% 96%);
  --bwl-text-2: hsl(220 9% 75%);
  --bwl-text-3: hsl(220 9% 55%);

  --bwl-bg-1: hsl(220 16% 12%);
  --bwl-bg-2: hsl(220 16% 16%);
  --bwl-bg-3: hsl(220 16% 22%);
}

:root {
  --bwl-ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
  --bwl-ease-bounce: cubic-bezier(0.34, 2, 0.6, 1);
  --bwl-ease-snap: cubic-bezier(0.25, 0.15, 0.29, 1.51);

  --bwl-duration-fast: 150ms;
  --bwl-duration-normal: 300ms;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

.bwl-root,
.bwl-root * {
  box-sizing: border-box;
  font-family: var(--bwl-font-family);
}

.bwl-root {
  font-size: var(--bwl-base-font-size);
  color: var(--bwl-text-1);
}

.bwl-page {
  max-width: var(--bwl-page-max-width);
  margin: 0 auto;
  padding: 24px 32px 24px calc(var(--bwl-dock-width-collapsed) + 24px);
}

.bwl-feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px 16px;
}

.bwl-cleanup {
  /* 广告位 / 弹窗检测提示 */
  .floor-single-card,
  .feed-card:has(.bili-video-card.is-rcmd:not(.enable-no-interest)),
  .bili-video-card.is-rcmd:not(.enable-no-interest),
  .ad-report,
  .brand-ad-list,
  .video-page-game-card-small,
  .pop-live-small-mode,
  .slide-ad-exp,
  .video-card-ad-small,
  .bili-dyn-ads,
  .adcard,
  .desktop-download-tip,
  .activity-my-container,
  .videowall-ad-1,
  .video-page-special-card-small,
  .video-page-card-small.report-flow-card,
  .adblock-tips {
    display: none !important;
  }

  .recommended-container_floor-aside .container > *:nth-of-type(n + 8) {
    margin-top: 0 !important;
    margin-bottom: 24px;
  }

  /* 首次进入活动弹窗 / App 下载引导 / 非必要登录引导 */
  .bili-mini-mask,
  .bili-mini-close-icon,
  .app-download-panel-pc,
  .download-app-tip,
  .van-popup--center:has(.activity-tip),
  .bili-feed4-layout .biliMain > .abtest-tip {
    display: none !important;
  }

  /* 充电 / 会员 / 赞助 */
  .video-charge-info,
  .charge-toast,
  .vip-guide-banner,
  .membership-guide,
  .big-vip-icon-tip,
  .video-toolbar-left-charge,
  .upower-charge-container,
  .bili-dyn-content__orig .bili-dyn-card-ad {
    display: none !important;
  }

  /* Logo：仅视觉隐藏，不涉及素材再分发 */
  .bili-header-m .bili-header__banner,
  .v-popover-wrap .header-cover,
  .bili-header-m .left-entry .default-entry svg,
  .player-icon-wrap .bilibili-logo,
  .video-info-detail-header .bili-logo-icon {
    visibility: hidden !important;
  }
}

/* 动态页净化：隐藏充电专属 / 预约 / 直播中 / 图文动态 */
.bili-dyn-item--charge,
.bili-dyn-item--reservation,
.bili-dyn-item--live,
.bili-dyn-item--article {
  display: none !important;
}

.bwl-danmaku-count-badge {
  opacity: 0.85;
  font-weight: 600;
}

.bwl-dock {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  border-radius: 0 var(--bwl-radius) var(--bwl-radius) 0;
  background: color-mix(in oklab, var(--bwl-bg-1), transparent 15%);
  backdrop-filter: var(--bwl-filter-glass);
  box-shadow: var(--bwl-shadow-2);
  padding: 8px 4px;
  width: var(--bwl-dock-width);
  overflow: hidden;
  transition: width var(--bwl-duration-normal) var(--bwl-ease-bounce);
}

.bwl-dock--collapsed {
  width: var(--bwl-dock-width-collapsed);
}

.bwl-dock__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bwl-dock__button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: var(--bwl-radius-half);
  color: var(--bwl-text-2);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--bwl-duration-fast) var(--bwl-ease-standard);
}
.bwl-dock__button:hover {
  background: var(--bwl-theme-color-10);
  color: var(--bwl-theme-color);
}

/* 触屏二次确认反馈 */
.bwl-dock__item.bwl-touch-armed .bwl-dock__button {
  background: var(--bwl-theme-color-10);
  color: var(--bwl-theme-color);
}

.bwl-dock__label {
  font-size: 13px;
}

/* 角标：锁死为纯圆点，不支持数字样式 */
.bwl-dock__item[data-has-update]::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bwl-theme-color);
  transform: translate(14px, -14px);
}

.bwl-top-bar {
  position: sticky;
  top: 0;
  z-index: 900;
  height: var(--bwl-top-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  background: color-mix(in oklab, var(--bwl-bg-1), transparent 20%);
  backdrop-filter: var(--bwl-filter-glass);
  transition: background var(--bwl-duration-normal) var(--bwl-ease-standard);
}

.bwl-top-bar__search {
  flex: 1;
  max-width: 480px;
}
.bwl-top-bar__search-input {
  width: 100%;
  height: 36px;
  border: none;
  border-radius: 18px;
  padding: 0 16px;
  background: var(--bwl-bg-2);
  color: var(--bwl-text-1);
  font-family: var(--bwl-font-family);
  font-size: 13px;
  outline: none;
  transition: box-shadow var(--bwl-duration-fast) var(--bwl-ease-standard);
}
.bwl-top-bar__search-input:focus {
  box-shadow: 0 0 0 2px var(--bwl-theme-color-40);
}

.bwl-top-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bwl-top-bar__icon-btn,
.bwl-top-bar__avatar-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--bwl-text-2);
  cursor: pointer;
  transition: background var(--bwl-duration-fast) var(--bwl-ease-standard),
    transform var(--bwl-duration-fast) var(--bwl-ease-bounce);
}
.bwl-top-bar__icon-btn:hover,
.bwl-top-bar__avatar-btn:hover {
  background: var(--bwl-theme-color-10);
  transform: scale(1.05);
}

.bwl-top-bar__icon-btn.bwl-touch-armed,
.bwl-top-bar__avatar-btn.bwl-touch-armed {
  background: var(--bwl-theme-color-10);
}

.bwl-top-bar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

/* 未读消息角标：锁死为纯圆点，不允许数字 */
.bwl-top-bar__icon-btn.bwl-has-badge::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bwl-error-color);
  border: 2px solid var(--bwl-bg-1);
}

/* 设置浮层：Tampermonkey 版没有 options.html，改为页面内居中弹层 */
.bwl-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 0.4);
  backdrop-filter: var(--bwl-filter-glass);
  animation: bwl-fade-in var(--bwl-duration-fast) var(--bwl-ease-standard);
}
@keyframes bwl-fade-in {
  from { opacity: 0; }
}

.bwl-settings-panel {
  width: 360px;
  max-height: 480px;
  overflow-y: auto;
  padding: 20px;
  background: var(--bwl-bg-1);
  border-radius: var(--bwl-radius);
  box-shadow: var(--bwl-shadow-3);
}

.bwl-settings-panel h2 {
  font-size: 16px;
  margin: 0 0 12px;
}

.bwl-settings-section {
  margin-bottom: 16px;
}
.bwl-settings-section h3 {
  font-size: 13px;
  color: var(--bwl-text-3);
  margin: 0 0 8px;
  font-weight: 500;
}

.bwl-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
}

.bwl-settings-row select {
  font-family: var(--bwl-font-family);
  border-radius: var(--bwl-radius-half);
  border: 1px solid var(--bwl-bg-3);
  padding: 4px 8px;
  background: var(--bwl-bg-2);
  color: var(--bwl-text-1);
}

.bwl-video-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: var(--bwl-radius);
  overflow: hidden;
  cursor: pointer;
}

.bwl-video-card__cover-link {
  display: block;
  text-decoration: none;
}

.bwl-video-card__cover {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--bwl-radius);
  overflow: hidden;
  background: var(--bwl-bg-3);
}

.bwl-video-card__cover-img,
.bwl-video-card__preview-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity var(--bwl-duration-normal) var(--bwl-ease-standard);
}

.bwl-video-card__preview-video {
  opacity: 0;
  pointer-events: none;
}
.bwl-video-card__preview-video.is-active {
  opacity: 1;
}

.bwl-video-card__duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 1px 6px;
  border-radius: var(--bwl-radius-half);
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: 12px;
  line-height: 1.6;
}

.bwl-video-card__seek-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  background: rgb(255 255 255 / 0.25);
  cursor: pointer;
}
.bwl-video-card__seek-fill {
  height: 100%;
  background: var(--bwl-theme-color);
  width: 0%;
  transition: width 80ms linear; /* 拖动跟手，不套用弹性曲线 */
}

.bwl-video-card__watch-later {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 0.5);
  color: #fff;
  backdrop-filter: var(--bwl-filter-glass);
  transition: transform var(--bwl-duration-fast) var(--bwl-ease-bounce);
}
.bwl-video-card__watch-later:hover {
  transform: scale(1.1);
}
.bwl-video-card__watch-later.is-active {
  color: var(--bwl-theme-color);
}

.bwl-video-card__meta {
  display: flex;
  gap: 8px;
}

.bwl-video-card__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bwl-video-card__meta-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bwl-video-card__title {
  color: var(--bwl-text-1);
  font-size: 14px;
  line-height: 1.4;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bwl-video-card__stats {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--bwl-text-3);
  font-size: 12px;
}

.bwl-video-page {
  background: var(--bwl-bg-1);
}

.bwl-video-page__top-bar {
  backdrop-filter: var(--bwl-filter-glass);
  background: color-mix(in oklab, var(--bwl-bg-1), transparent 25%);
}
`;

  GM_addStyle(CSS);

  // ---------------------------------------------------------------------
  // 共享 DOM 变化调度器：单一 MutationObserver，各模块注册处理函数，
  // 用 rAF 批量节流触发，避免多个 observer 各自重复全量扫描
  // ---------------------------------------------------------------------
  const domHandlers = new Set();
  let scheduled = false;
  let pendingMutations = [];

  function registerDomHandler(fn) {
    domHandlers.add(fn);
    return () => domHandlers.delete(fn);
  }

  function scheduleRun(mutations) {
    if (mutations) pendingMutations.push(...mutations);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const batch = pendingMutations;
      pendingMutations = [];
      for (const fn of domHandlers) {
        try { fn(batch); } catch (e) { console.error('[Bewlias] handler error:', e); }
      }
    });
  }

  new MutationObserver(scheduleRun).observe(document.documentElement, { childList: true, subtree: true });

  // ---------------------------------------------------------------------
  // 极简状态管理：Proxy 替代 ref/computed，赋值直接触发订阅者
  // ---------------------------------------------------------------------
  function createStore(initialState) {
    const state = { ...initialState };
    const listeners = new Map();
    const wildcard = new Set();

    return new Proxy(state, {
      get(target, key) {
        if (key === 'subscribe') {
          return (k, fn) => {
            if (!listeners.has(k)) listeners.set(k, new Set());
            listeners.get(k).add(fn);
            return () => listeners.get(k)?.delete(fn);
          };
        }
        if (key === 'subscribeAll') return (fn) => (wildcard.add(fn), () => wildcard.delete(fn));
        return target[key];
      },
      set(target, key, value) {
        if (target[key] === value) return true;
        target[key] = value;
        listeners.get(key)?.forEach((fn) => fn(value, key));
        wildcard.forEach((fn) => fn(target));
        return true;
      },
    });
  }

  // 把模板字符串转为真实节点，只用于拼接静态结构（不含用户数据插值）
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const setText = (el, text) => (el.textContent = text ?? ''); // 安全设置文本，替代拼 innerHTML（防 XSS）
  const on = (el, event, selector, handler) =>
    el.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target && el.contains(target)) handler(e, target);
    });

  // 共享图标：内联 SVG，无图标库依赖
  const icon = (path, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path fill="currentColor" d="${path}"/></svg>`;
  const ICON_HOME = 'M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z';
  const ICON_MOMENTS = 'M4 4h16v12H7l-3 3z';
  const ICON_MESSAGES = 'M2 4h20v14H6l-4 4z';
  const ICON_SETTINGS = 'M12 8a4 4 0 100 8 4 4 0 000-8zm8.94 4a7.94 7.94 0 00-.18-1.65l2.11-1.65-2-3.46-2.49 1a8.1 8.1 0 00-1.43-.83l-.38-2.65h-4l-.38 2.65a8.1 8.1 0 00-1.43.83l-2.49-1-2 3.46 2.11 1.65A7.94 7.94 0 003.06 12c0 .56.06 1.11.18 1.65l-2.11 1.65 2 3.46 2.49-1c.44.33.92.61 1.43.83l.38 2.65h4l.38-2.65c.51-.22.99-.5 1.43-.83l2.49 1 2-3.46-2.11-1.65c.12-.54.18-1.09.18-1.65z';
  const ICON_BELL = 'M12 22a2.4 2.4 0 002.4-2.4h-4.8A2.4 2.4 0 0012 22zm7.2-6V11c0-3.5-1.87-6.43-5.16-7.21A1.2 1.2 0 0013.2 3a1.2 1.2 0 00-2.4 0 1.2 1.2 0 00-.84.79C6.67 4.57 4.8 7.5 4.8 11v5l-1.8 1.8V19h18v-1.2z';
  const ICON_CLOCK = 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59l4.3 4.3-1.42 1.42L11 13V6h2v6.59z';

  // GM_getValue/setValue 适配层：接口形状对齐 chrome.storage.local，同步 API 包一层 Promise 保持 await 语义
  const gmStorage = {
    get(keyOrKeys) {
      const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      return Promise.resolve(Object.fromEntries(keys.map((k) => [k, GM_getValue(k)])));
    },
    set(obj) {
      for (const [key, value] of Object.entries(obj)) GM_setValue(key, value);
      return Promise.resolve();
    },
    remove(key) {
      GM_deleteValue(key);
      return Promise.resolve();
    },
  };

  // 极简 i18n：扁平字典 + navigator.language，替代 chrome.i18n
  const zhCN = {
    settingsTitle: '设置',
    settingsAppearance: '外观',
    settingsPrivacy: '隐私',
    settingsContent: '内容',
    settingsAbout: '关于',
    colorMode: '配色模式',
    colorModeAuto: '跟随系统',
    colorModeLight: '浅色',
    colorModeDark: '深色',
    showAvNumber: '展示 AV 号而非 BV 号',
    recommendationMode: '推荐来源',
    recommendationModeWeb: '网页版（登录态）',
    recommendationModeWebNoCookie: '网页版，免 Cookie',
    rememberNoCookieState: '记住免 Cookie 推荐的翻页位置',
    enableFeedFilters: '启用推荐流过滤',
    exemptFollowedFromFilters: '已关注的 up 主始终显示',
  };
  const en = {
    settingsTitle: 'Settings',
    settingsAppearance: 'Appearance',
    settingsPrivacy: 'Privacy',
    settingsContent: 'Content',
    settingsAbout: 'About',
    colorMode: 'Color mode',
    colorModeAuto: 'Follow system',
    colorModeLight: 'Light',
    colorModeDark: 'Dark',
    showAvNumber: 'Show AV number instead of BV number',
    recommendationMode: 'Recommendation source',
    recommendationModeWeb: 'Web (signed in)',
    recommendationModeWebNoCookie: 'Web, cookie-free',
    rememberNoCookieState: 'Remember cookie-free feed position',
    enableFeedFilters: 'Enable feed filters',
    exemptFollowedFromFilters: 'Always show videos from creators you follow',
  };
  const dict = navigator.language.startsWith('zh') ? zhCN : en;
  const t = (key) => dict[key] ?? key;

  // 仅此 6 项因人而异、会持久化并出现在设置面板；其余行为一律锁死（见 README）
  const DEFAULT_SETTINGS = {
    colorMode: 'auto', // 'auto' | 'light' | 'dark'
    showAvNumber: true,

    recommendationMode: 'webNoCookie', // 'web' | 'webNoCookie'
    rememberNoCookieState: true,

    enableFeedFilters: false,
    exemptFollowedFromFilters: true,
    feedFilterRules: {
      filterOutVerticalVideos: false,
      enableFilterByViewCount: false,
      filterByViewCount: 10000,
      enableFilterByLikeCount: false,
      filterByLikeCount: 1000,
      enableFilterByDuration: false,
      filterByDuration: 3600,
      enableFilterByTitle: false,
      filterByTitle: [], // [{ keyword, remark }]
      enableFilterByUser: false,
      filterByUser: [], // [{ keyword, remark }]
      enableFilterByPublishTime: false,
      filterByPublishTime: 30, // 天
    },
  };

  // ---------------------------------------------------------------------
  // B 站 API：web / webNoCookie 共用同一端点，区别仅在于是否携带 credentials
  // ---------------------------------------------------------------------
  const NAV_URL = 'https://api.bilibili.com/x/web-interface/nav';
  const UNREAD_MSG_URL = 'https://api.bilibili.com/x/msgfeed/unread';
  const WEB_RECOMMEND_URL = 'https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd';
  const VIDEO_PREVIEW_URL = 'https://api.bilibili.com/x/player/videoshot';

  async function getCurrentUser() {
    try {
      const res = await fetch(NAV_URL, { credentials: 'same-origin' }).then((r) => r.json());
      return res?.data?.isLogin ? { avatarUrl: res.data.face } : null;
    } catch (e) {
      console.warn('[Bewlias] getCurrentUser failed:', e);
      return null;
    }
  }

  // 是否有未读消息：锁死为纯圆点展示，只需要布尔值
  async function hasUnreadMessages() {
    try {
      const d = (await fetch(UNREAD_MSG_URL, { credentials: 'same-origin' }).then((r) => r.json()))?.data;
      return !!d && d.at + d.chat + d.like + d.reply + d.sys_msg > 0;
    } catch (e) {
      console.warn('[Bewlias] hasUnreadMessages failed:', e);
      return false;
    }
  }

  async function getRecommendVideos({ mode, freshIdx, lastShowlist, pageSize = 12 }) {
    const url = new URL(WEB_RECOMMEND_URL);
    const params = {
      fresh_type: 4,
      feed_version: 'V8',
      homepage_ver: 1,
      ps: pageSize,
      fresh_idx: freshIdx,
      fresh_idx_1h: freshIdx,
      last_showlist: lastShowlist || '',
    };
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const response = await fetch(url, {
      method: 'GET',
      credentials: mode === 'webNoCookie' ? 'omit' : 'same-origin', // 免 Cookie 模式不携带 cookie，避免服务端做个性化画像
    });
    if (!response.ok) throw new Error(`推荐流请求失败: ${response.status}`);
    return response.json();
  }

  async function getVideoPreview(bvid, cid) {
    const url = new URL(VIDEO_PREVIEW_URL);
    url.searchParams.set('bvid', bvid);
    if (cid) url.searchParams.set('cid', cid);
    url.searchParams.set('index', '1');

    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) return null;
    return (await response.json())?.data?.image?.[0] ?? null;
  }

  // ---------------------------------------------------------------------
  // 功能模块
  // ---------------------------------------------------------------------

  // 链接清理：永久开启，清理地址栏当前 URL 中的跟踪/来源参数
  const URL_PARAMS_TO_STRIP = [
    'spm_id_from', 'from_source', 'msource', 'bsource', 'seid', 'source', 'session_id',
    'visit_id', 'sourceFrom', 'from_spmid', 'share_source', 'share_medium', 'share_plat',
    'share_session_id', 'share_tag', 'unique_k', 'csource', 'vd_source', 'tab', 'trackid',
    'is_story_h5', 'share_from', 'plat_id', '-Arouter', 'launch_id', 'live_from', 'hotRank',
    'broadcast_type',
  ];

  function cleanCurrentUrlParams() {
    const currentUrl = new URL(window.location.href);
    let hasChanged = false;
    for (const param of URL_PARAMS_TO_STRIP) {
      if (currentUrl.searchParams.has(param)) {
        currentUrl.searchParams.delete(param);
        hasChanged = true;
      }
    }
    if (!hasChanged) return;
    const newUrl = currentUrl.toString().replace(/([^:])\/\//g, '$1/').replace(/%3D/gi, '=').replace(/%26/g, '&');
    history.replaceState(null, '', newUrl);
  }

  function initUrlCleaner() {
    if (document.readyState === 'complete') cleanCurrentUrlParams();
    else window.addEventListener('load', cleanCurrentUrlParams, { once: true });
    window.requestIdleCallback?.(cleanCurrentUrlParams);

    window.addEventListener('popstate', () => queueMicrotask(cleanCurrentUrlParams));

    // 覆盖 pushState/replaceState：B 站 SPA 内导航大多走这两个 API
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        queueMicrotask(cleanCurrentUrlParams);
        return result;
      };
    }
  }

  // AV/BV 号显示切换：默认展示 AV 号，可在设置里关闭
  const AV_TABLE = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
  const AV_XOR_CODE = 23442827791579n;
  const AV_MASK = (1n << 51n) - 1n;

  function bv2av(bv) {
    if (!/^BV1[\dA-Za-z]{9}$/.test(bv)) return bv;
    const chars = [...bv];
    [chars[3], chars[9]] = [chars[9], chars[3]];
    [chars[4], chars[7]] = [chars[7], chars[4]];

    let tmp = 0n;
    for (const c of chars.slice(3)) tmp = tmp * 58n + BigInt(AV_TABLE.indexOf(c));
    return `av${((tmp & AV_MASK) ^ AV_XOR_CODE).toString()}`;
  }

  function handleUrl() {
    const match = window.location.pathname.match(/(\/video\/)(BV1[\dA-Za-z]{9})/);
    if (!match) return;
    const av = bv2av(match[2]);
    if (av === match[2]) return;
    history.replaceState(null, '', window.location.href.replace(match[2], av));
  }

  let unregisterAvBvHandler = null;

  function enableAvBvSwitch() {
    if (unregisterAvBvHandler) return;
    window.addEventListener('popstate', handleUrl);
    unregisterAvBvHandler = registerDomHandler(handleUrl); // SPA 内部路由跳转不触发 popstate 时的兜底
    handleUrl();
  }

  function disableAvBvSwitch() {
    window.removeEventListener('popstate', handleUrl);
    unregisterAvBvHandler?.();
    unregisterAvBvHandler = null;
  }

  // 触屏优化：设备支持触屏时自动启用，无需手动开关。首次点击只做确认反馈，
  // 短暂窗口内第二次点击才真正跳转，避免误触
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const TOUCH_CONFIRM_WINDOW_MS = 2000;

  function withTouchConfirm(handler, isExempt = () => false) {
    if (!isTouchDevice) return handler;
    return (e, target) => {
      if (isExempt(target) || target.classList.contains('bwl-touch-armed')) {
        target.classList.remove('bwl-touch-armed');
        handler(e, target);
        return;
      }
      e.preventDefault();
      target.classList.add('bwl-touch-armed');
      setTimeout(() => target.classList.remove('bwl-touch-armed'), TOUCH_CONFIRM_WINDOW_MS);
    };
  }

  // B 站原生清洗（JS 兜底）：CSS 规则处理绝大多数静态广告位，这里用文本特征
  // 兜底动态插入、类名带随机 hash 后缀的弹窗。永久开启，无开关
  const POPUP_TEXT_SIGNATURES = ['开通大会员', '立即充电', '下载客户端', '扫码下载', '新人专享'];

  function looksLikePromotionalPopup(el) {
    // 先做便宜的文本检查排除大多数节点，只有命中关键词的才调用较贵的 getComputedStyle
    const text = el.textContent?.trim();
    if (!text || text.length > 200 || !POPUP_TEXT_SIGNATURES.some((sig) => text.includes(sig))) return false;
    const style = getComputedStyle(el);
    return style.position === 'fixed' || style.position === 'absolute';
  }

  function sweepNode(node) {
    if (!(node instanceof HTMLElement)) return;
    if (looksLikePromotionalPopup(node)) {
      node.remove();
      return;
    }
    for (const child of node.children) {
      if (looksLikePromotionalPopup(child)) child.remove();
    }
  }

  function initBilibiliCleanup() {
    document.documentElement.classList.add('bwl-cleanup');
    registerDomHandler((mutations) => {
      for (const m of mutations) for (const n of m.addedNodes) sweepNode(n);
    });
  }

  // 弹幕合并去重：滚动时间窗口内，归一化后文本相同的弹幕只保留第一条并叠加 ×N 计数
  const DANMAKU_MERGE_WINDOW_MS = 4000;
  const DANMAKU_CONTAINER_SELECTOR = '.bili-danmaku-x-dm-container, .bili-danmaku-x';
  const DANMAKU_ITEM_SELECTOR = '.bili-danmaku-x-dm';
  const recentDanmaku = new Map(); // normalizedText -> { node, count, timestamp }

  function normalizeDanmakuText(text) {
    return text.trim().replace(/(.)\1{2,}/gu, '$1').toLowerCase(); // 连续重复单字符折叠为 1 次："哈哈哈哈" -> "哈"
  }

  function pruneDanmakuHistory() {
    const now = performance.now();
    for (const [key, entry] of recentDanmaku) {
      if (now - entry.timestamp > DANMAKU_MERGE_WINDOW_MS) recentDanmaku.delete(key);
    }
  }

  function ensureDanmakuBadge(node) {
    let badge = node.querySelector(':scope > .bwl-danmaku-count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'bwl-danmaku-count-badge';
      node.appendChild(badge);
    }
    return badge;
  }

  function handleDanmakuNode(node) {
    const text = node.textContent?.trim();
    if (!text) return;
    const key = normalizeDanmakuText(text);
    const existing = recentDanmaku.get(key);
    if (existing?.node.isConnected) {
      existing.count += 1;
      existing.timestamp = performance.now();
      ensureDanmakuBadge(existing.node).textContent = ` ×${existing.count}`;
      node.style.display = 'none';
      node.dataset.bwlMerged = 'true';
      return;
    }
    recentDanmaku.set(key, { node, count: 1, timestamp: performance.now() });
  }

  function initDanmakuMerge() {
    setInterval(pruneDanmakuHistory, 2000); // 独立低频清理，而非在每条弹幕到达时都遍历全表

    const danmakuObserver = new MutationObserver((mutations) => {
      for (const m of mutations) for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        if (n.matches?.(DANMAKU_ITEM_SELECTOR)) handleDanmakuNode(n);
        n.querySelectorAll?.(DANMAKU_ITEM_SELECTOR).forEach(handleDanmakuNode);
      }
    });

    // 弹幕容器是播放器加载后才出现，借共享调度器等它出现，找到后立即取消注册
    const unregister = registerDomHandler(() => {
      const container = document.querySelector(DANMAKU_CONTAINER_SELECTOR);
      if (container) {
        danmakuObserver.observe(container, { childList: true, subtree: true });
        unregister();
      }
    });
  }

  // ---------------------------------------------------------------------
  // 首页推荐流：拉取分页 + 过滤规则 + 渲染卡片
  // ---------------------------------------------------------------------
  const FORYOU_MAX_SHOWLIST_GROUPS = 5;
  const FORYOU_STORAGE_KEY = 'noCookieForYouRecommendationState';
  let foryouCursors = { web: 1, webNoCookie: 1 };
  let foryouShowlistGroups = [];

  async function loadPersistedState() {
    const saved = (await gmStorage.get(FORYOU_STORAGE_KEY))[FORYOU_STORAGE_KEY];
    if (saved) {
      foryouCursors.webNoCookie = saved.nextFreshIdx ?? 1;
      foryouShowlistGroups = saved.showlistGroups ?? [];
    }
  }

  function persistForyouState(rememberState) {
    if (!rememberState) return;
    gmStorage.set({ [FORYOU_STORAGE_KEY]: { nextFreshIdx: foryouCursors.webNoCookie, showlistGroups: foryouShowlistGroups } });
  }

  // 首次刷新（非加载更多）且开启"记住位置"才从游标继续；否则从 1 开始新一轮
  async function fetchForYouPage({ mode, rememberState, isLoadMore = false }) {
    if (!isLoadMore && !(mode === 'webNoCookie' && rememberState)) foryouCursors[mode] = 1;

    const lastShowlist = mode === 'webNoCookie' ? foryouShowlistGroups.at(-1) ?? '' : '';
    const response = await getRecommendVideos({ mode, freshIdx: foryouCursors[mode], lastShowlist, pageSize: isLoadMore ? 15 : 12 });
    if (response?.code !== 0) throw new Error(response?.message ?? '推荐流请求失败');

    const { item: videos = [], showlist, fresh_idx: newFreshIdx } = response.data ?? {};
    if (newFreshIdx !== undefined) foryouCursors[mode] = newFreshIdx;

    if (mode === 'webNoCookie') {
      if (showlist) foryouShowlistGroups = [...foryouShowlistGroups, showlist].slice(-FORYOU_MAX_SHOWLIST_GROUPS);
      persistForyouState(rememberState);
    }
    return videos;
  }

  function resetForYouState() {
    foryouCursors = { web: 1, webNoCookie: 1 };
    foryouShowlistGroups = [];
    gmStorage.remove(FORYOU_STORAGE_KEY);
  }

  // 推荐流过滤：每种条件抽象为 (item, keyPath, filterValue) => boolean，全部满足才保留
  function pluck(obj, path) {
    return path.reduce((acc, part) => acc?.[part], obj);
  }

  function compareNumber(item, keyPath, filterValue) {
    return pluck(item, keyPath) > filterValue;
  }

  function compareNumberString(item, keyPath, filterValue) {
    const value = pluck(item, keyPath);
    if (typeof value === 'string' && (value.includes('万') || value.includes('萬'))) {
      return Number(value.replace(/万|萬/g, '')) * 10000 > filterValue;
    }
    const numeric = Number(value);
    return !Number.isNaN(numeric) && numeric > filterValue;
  }

  function comparePublishTime(item, keyPath, filterValueDays) {
    const publishTimestamp = pluck(item, keyPath);
    if (!publishTimestamp) return false;
    return Math.floor(Date.now() / 1000) - publishTimestamp <= filterValueDays * 86400;
  }

  function buildKeywordMatchers(rules) {
    const strings = [];
    const regexes = [];
    for (const rule of rules) {
      if (rule.keyword.startsWith('/') && rule.keyword.endsWith('/')) {
        try { regexes.push(new RegExp(rule.keyword.slice(1, -1), 'i')); }
        catch { console.warn('[Bewlias] 忽略非法的过滤正则:', rule.keyword); } // 一条规则写错不该拖垮整个过滤器
      } else {
        strings.push(rule.keyword.toUpperCase());
      }
    }
    return { strings, regexes };
  }

  const isVerticalVideo = (dimension) => !!dimension && dimension.height > dimension.width;

  function createFeedFilter(settings, isFollowedKeyPath = ['author', 'isFollowed']) {
    const rules = settings.feedFilterRules ?? {};
    const titleMatchers = buildKeywordMatchers(rules.filterByTitle ?? []);
    const userMatchers = buildKeywordMatchers(rules.filterByUser ?? []);
    const activeChecks = [];

    if (rules.filterOutVerticalVideos) activeChecks.push((item) => !isVerticalVideo(pluck(item, ['dimension'])));
    if (rules.enableFilterByViewCount) {
      activeChecks.push((item) =>
        typeof pluck(item, ['stat', 'view']) === 'string'
          ? compareNumberString(item, ['stat', 'view'], rules.filterByViewCount)
          : compareNumber(item, ['stat', 'view'], rules.filterByViewCount));
    }
    if (rules.enableFilterByLikeCount) activeChecks.push((item) => compareNumber(item, ['stat', 'like'], rules.filterByLikeCount));
    if (rules.enableFilterByDuration) activeChecks.push((item) => compareNumber(item, ['duration'], rules.filterByDuration));
    if (rules.enableFilterByTitle) {
      activeChecks.push((item) => {
        const title = `${pluck(item, ['title']) ?? ''}`.toUpperCase();
        return !(titleMatchers.strings.some((kw) => title.includes(kw)) || titleMatchers.regexes.some((re) => re.test(title)));
      });
    }
    if (rules.enableFilterByUser) {
      activeChecks.push((item) => {
        const name = `${pluck(item, ['author', 'name']) ?? ''}`.toUpperCase();
        return !(userMatchers.strings.includes(name) || userMatchers.regexes.some((re) => re.test(name)));
      });
    }
    if (rules.enableFilterByPublishTime) activeChecks.push((item) => comparePublishTime(item, ['pubdate'], rules.filterByPublishTime));

    if (activeChecks.length === 0) return () => true; // 无规则启用时直接放行，避免无意义遍历

    return function filterItem(item) {
      if (settings.exemptFollowedFromFilters && pluck(item, isFollowedKeyPath)) return true; // 已关注 up 主始终豁免
      return activeChecks.every((check) => check(item));
    };
  }

  // ---------------------------------------------------------------------
  // 组件
  // ---------------------------------------------------------------------

  // VideoCard：拖动进度条需要 window 级 pointermove/pointerup；信息流一次渲染几十到
  // 上百张卡片，共享一份 window 监听器（而非逐卡片绑定），只有正在拖动的那张会响应
  const VIDEOCARD_HOVER_DELAY_MS = 600;
  let activeSeek = null; // { videoEl, seekFill, seekBar } | null

  window.addEventListener('pointermove', (e) => activeSeek && seekTo(activeSeek, e.clientX));
  window.addEventListener('pointerup', () => { activeSeek = null; });

  function seekTo({ videoEl, seekBar, seekFill }, clientX) {
    const rect = seekBar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (videoEl.duration) videoEl.currentTime = ratio * videoEl.duration;
    seekFill.style.width = `${ratio * 100}%`;
  }

  function formatCount(n) {
    if (n >= 1e8) return `${(n / 1e8).toFixed(1)}亿`;
    if (n >= 1e4) return `${(n / 1e4).toFixed(1)}万`;
    return String(n);
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function formatRelativeTime(isoDate) {
    const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
    if (days < 1) return '今天';
    if (days < 30) return `${days} 天前`;
    const months = Math.floor(days / 30);
    return months < 12 ? `${months} 个月前` : `${Math.floor(months / 12)} 年前`;
  }

  function setupHoverPreview(card, video) {
    const coverEl = card.querySelector('.bwl-video-card__cover');
    const videoEl = card.querySelector('.bwl-video-card__preview-video');
    const seekBar = card.querySelector('.bwl-video-card__seek-bar');
    const seekFill = card.querySelector('.bwl-video-card__seek-fill');
    let hoverTimer = null;
    let previewUrl = null;

    const loadPreviewIfNeeded = async () => (previewUrl ??= await getVideoPreview(video.bvid, video.cid).catch(() => null));

    coverEl.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(async () => {
        const url = await loadPreviewIfNeeded();
        if (!url) return;
        videoEl.src = url;
        videoEl.classList.add('is-active');
        seekBar.hidden = false;
        videoEl.play().catch(() => {});
      }, VIDEOCARD_HOVER_DELAY_MS);
    });

    coverEl.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      videoEl.pause();
      videoEl.classList.remove('is-active');
      seekBar.hidden = true;
    });

    seekBar.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      activeSeek = { videoEl, seekBar, seekFill };
      seekTo(activeSeek, e.clientX);
    });

    videoEl.addEventListener('timeupdate', () => {
      if (activeSeek?.videoEl !== videoEl && videoEl.duration) seekFill.style.width = `${(videoEl.currentTime / videoEl.duration) * 100}%`;
    });
  }

  // 稍后再看：只在 hover 时出现的按钮
  function setupWatchLaterToggle(card, video) {
    const coverEl = card.querySelector('.bwl-video-card__cover');
    const btn = card.querySelector('.bwl-video-card__watch-later');
    coverEl.addEventListener('mouseenter', () => { btn.hidden = false; });
    coverEl.addEventListener('mouseleave', () => { btn.hidden = true; });

    on(card, 'click', '.bwl-video-card__watch-later', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('is-active');
      card.dispatchEvent(new CustomEvent('bwl:watch-later-toggle', {
        bubbles: true,
        detail: { bvid: video.bvid, active: btn.classList.contains('is-active') },
      }));
    });
  }

  // video: 标准化后的视频数据，字段形状见下方 normalizeVideo
  function createVideoCard(video) {
    const card = h(`
      <article class="bwl-video-card">
        <a class="bwl-video-card__cover-link">
          <div class="bwl-video-card__cover">
            <img class="bwl-video-card__cover-img" loading="lazy" />
            <video class="bwl-video-card__preview-video" muted playsinline></video>
            <div class="bwl-video-card__duration"></div>
            <div class="bwl-video-card__seek-bar" hidden>
              <div class="bwl-video-card__seek-fill"></div>
            </div>
            <button class="bwl-video-card__watch-later" type="button" aria-label="稍后再看" hidden>
              ${icon(ICON_CLOCK, 16)}
            </button>
          </div>
        </a>
        <div class="bwl-video-card__meta">
          <img class="bwl-video-card__avatar" loading="lazy" />
          <div class="bwl-video-card__meta-text">
            <a class="bwl-video-card__title"></a>
            <div class="bwl-video-card__stats">
              <span class="bwl-video-card__views"></span>
              <span class="bwl-video-card__dot">·</span>
              <span class="bwl-video-card__time"></span>
            </div>
          </div>
        </div>
      </article>
    `);

    card.dataset.bvid = video.bvid;
    for (const a of card.querySelectorAll('a')) a.href = video.url;

    setText(card.querySelector('.bwl-video-card__title'), video.title);
    setText(card.querySelector('.bwl-video-card__views'), formatCount(video.viewCount));
    setText(card.querySelector('.bwl-video-card__time'), formatRelativeTime(video.publishedAt));
    setText(card.querySelector('.bwl-video-card__duration'), formatDuration(video.durationSeconds));

    const coverImg = card.querySelector('.bwl-video-card__cover-img');
    coverImg.src = video.coverUrl;
    coverImg.alt = video.title;

    const avatarImg = card.querySelector('.bwl-video-card__avatar');
    avatarImg.src = video.authorAvatarUrl;
    avatarImg.alt = video.authorName;

    setupHoverPreview(card, video);
    setupWatchLaterToggle(card, video);
    return card;
  }

  // Dock：锁死左侧 + 半隐藏（悬浮展开完整宽度），只保留 4 个核心入口
  const DOCK_HOVER_ENTER_DELAY = 100;
  const DOCK_HOVER_LEAVE_DELAY = 600;
  const DOCK_ITEMS = [
    { id: 'home', label: '首页', path: ICON_HOME },
    { id: 'moments', label: '动态', path: ICON_MOMENTS },
    { id: 'messages', label: '消息', path: ICON_MESSAGES },
    { id: 'settings', label: '设置', path: ICON_SETTINGS },
  ];

  function setupHoverExpand(dock) {
    let enterTimer, leaveTimer;
    dock.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      enterTimer = setTimeout(() => dock.classList.remove('bwl-dock--collapsed'), DOCK_HOVER_ENTER_DELAY);
    });
    dock.addEventListener('mouseleave', () => {
      clearTimeout(enterTimer);
      leaveTimer = setTimeout(() => dock.classList.add('bwl-dock--collapsed'), DOCK_HOVER_LEAVE_DELAY);
    });
  }

  function createDock({ onItemClick }) {
    const dock = h(`
      <nav class="bwl-dock bwl-dock--collapsed" aria-label="Bewlias 导航">
        <ul class="bwl-dock__list">
          ${DOCK_ITEMS.map((item) => `
            <li class="bwl-dock__item" data-item-id="${item.id}">
              <button type="button" class="bwl-dock__button" aria-label="${item.label}">
                ${icon(item.path)}
                <span class="bwl-dock__label">${item.label}</span>
              </button>
            </li>
          `).join('')}
        </ul>
      </nav>
    `);

    on(dock, 'click', '.bwl-dock__item', withTouchConfirm(
      (_e, target) => onItemClick?.(target.dataset.itemId),
      (target) => target.dataset.itemId === 'home',
    ));
    setupHoverExpand(dock);
    return dock;
  }

  // TopBar：对比完整版大幅精简，只保留高频操作，其余通过跳转原生页面处理
  function createTopBar({ onSearch, onOpenSettings }) {
    const bar = h(`
      <header class="bwl-top-bar">
        <div class="bwl-top-bar__search">
          <input type="search" class="bwl-top-bar__search-input" placeholder="搜索" />
        </div>
        <div class="bwl-top-bar__actions">
          <button type="button" class="bwl-top-bar__icon-btn" data-action="notifications" aria-label="消息通知">
            ${icon(ICON_BELL)}
          </button>
          <button type="button" class="bwl-top-bar__avatar-btn" data-action="profile" aria-label="个人空间">
            <img class="bwl-top-bar__avatar" alt="" />
          </button>
          <button type="button" class="bwl-top-bar__icon-btn" data-action="settings" aria-label="设置">
            ${icon(ICON_SETTINGS, 18)}
          </button>
        </div>
      </header>
    `);

    const input = bar.querySelector('.bwl-top-bar__search-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) onSearch?.(input.value.trim());
    });

    const ROUTES = { profile: 'https://space.bilibili.com/', notifications: 'https://message.bilibili.com/' };
    on(bar, 'click', '[data-action]', withTouchConfirm(
      (_e, target) => {
        const action = target.dataset.action;
        action === 'settings' ? onOpenSettings?.() : ROUTES[action] && (location.href = ROUTES[action]);
      },
      (target) => target.dataset.action === 'settings', // 打开设置浮层不是跳转，不需要二次确认
    ));
    return bar;
  }

  const setNotificationBadge = (bar, hasUnread) => bar.querySelector('[data-action="notifications"]').classList.toggle('bwl-has-badge', !!hasUnread);
  const setUserAvatar = (bar, avatarUrl) => { bar.querySelector('.bwl-top-bar__avatar').src = avatarUrl; };

  // SettingsPanel：仅 4 个模块、约 6 个可调项，不做"高级/更多设置"折叠区
  const SETTINGS_SECTIONS = [
    {
      titleKey: 'settingsAppearance',
      fields: [
        { key: 'colorMode', type: 'select', labelKey: 'colorMode', options: [
          { value: 'auto', labelKey: 'colorModeAuto' },
          { value: 'light', labelKey: 'colorModeLight' },
          { value: 'dark', labelKey: 'colorModeDark' },
        ] },
        { key: 'showAvNumber', type: 'toggle', labelKey: 'showAvNumber' },
      ],
    },
    {
      titleKey: 'settingsPrivacy',
      fields: [
        { key: 'recommendationMode', type: 'select', labelKey: 'recommendationMode', options: [
          { value: 'web', labelKey: 'recommendationModeWeb' },
          { value: 'webNoCookie', labelKey: 'recommendationModeWebNoCookie' },
        ] },
        { key: 'rememberNoCookieState', type: 'toggle', labelKey: 'rememberNoCookieState' },
      ],
    },
    {
      titleKey: 'settingsContent',
      fields: [
        { key: 'enableFeedFilters', type: 'toggle', labelKey: 'enableFeedFilters' },
        { key: 'exemptFollowedFromFilters', type: 'toggle', labelKey: 'exemptFollowedFromFilters' },
      ],
    },
    { titleKey: 'settingsAbout', fields: [] },
  ];

  const SETTINGS_RENDERERS = {
    toggle: (field, settings) => {
      const input = h('<input type="checkbox">');
      input.checked = !!settings[field.key];
      input.onchange = () => (settings[field.key] = input.checked);
      return input;
    },
    select: (field, settings) => {
      const select = h(`<select>${field.options.map((o) => `<option value="${o.value}">${t(o.labelKey)}</option>`).join('')}</select>`);
      select.value = settings[field.key];
      select.onchange = () => (settings[field.key] = select.value);
      return select;
    },
  };

  function renderSettingsField(field, settings) {
    const row = h('<label class="bwl-settings-row"><span></span></label>');
    setText(row.firstElementChild, t(field.labelKey));
    row.append(SETTINGS_RENDERERS[field.type](field, settings));
    return row;
  }

  function createSettingsPanel(settings) {
    const panel = h('<div class="bwl-settings-panel"><h2></h2></div>');
    setText(panel.firstElementChild, t('settingsTitle'));
    for (const { titleKey, fields } of SETTINGS_SECTIONS) {
      const section = h('<section class="bwl-settings-section"><h3></h3></section>');
      setText(section.firstElementChild, t(titleKey));
      section.append(...fields.map((f) => renderSettingsField(f, settings)));
      panel.append(section);
    }
    return panel;
  }

  // ---------------------------------------------------------------------
  // 首页信息流：串联 forYou（拉数据）+ feedFilters（过滤）+ VideoCard（渲染）
  // ---------------------------------------------------------------------

  // B 站接口返回 snake_case，这里转换成 VideoCard/feedFilters 期望的字段
  function normalizeVideo(raw) {
    return {
      bvid: raw.bvid,
      cid: raw.cid,
      url: `https://www.bilibili.com/video/${raw.bvid}`,
      title: raw.title,
      coverUrl: raw.pic,
      durationSeconds: raw.duration,
      duration: raw.duration, // feedFilters 按 ['duration'] 过滤，字段名需与之对齐
      viewCount: raw.stat?.view ?? 0,
      publishedAt: new Date((raw.pubdate ?? 0) * 1000).toISOString(),
      authorName: raw.owner?.name ?? '',
      authorAvatarUrl: raw.owner?.face ?? '',
      author: { name: raw.owner?.name ?? '', isFollowed: !!raw.is_followed }, // feedFilters 按 ['author','isFollowed'] 判断豁免
      stat: raw.stat,
      dimension: raw.dimension,
      pubdate: raw.pubdate,
    };
  }

  async function loadFeedCards(settings, isLoadMore = false) {
    const rawVideos = await fetchForYouPage({ mode: settings.recommendationMode, rememberState: settings.rememberNoCookieState, isLoadMore });
    const videos = rawVideos.map(normalizeVideo);
    const passesFilter = settings.enableFeedFilters ? createFeedFilter(settings) : () => true;
    return videos.filter(passesFilter).map(createVideoCard);
  }

  function mountFeed(settings) {
    const grid = document.createElement('div');
    grid.className = 'bwl-feed-grid';

    const sentinel = document.createElement('div');
    sentinel.className = 'bwl-feed-grid__sentinel';
    grid.append(sentinel);

    let loading = false;
    const loadMore = async (isLoadMore) => {
      if (loading) return;
      loading = true;
      try {
        sentinel.before(...(await loadFeedCards(settings, isLoadMore)));
      } catch (err) {
        console.error('[Bewlias] 推荐流加载失败', err);
      } finally {
        loading = false;
      }
    };
    loadMore(false);

    new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(true)).observe(sentinel);
    return grid;
  }

  // ---------------------------------------------------------------------
  // 入口
  // ---------------------------------------------------------------------
  const DOCK_ROUTES = {
    home: 'https://www.bilibili.com/',
    moments: 'https://t.bilibili.com/',
    messages: 'https://message.bilibili.com/',
  };
  const navigate = (id) => DOCK_ROUTES[id] && (location.href = DOCK_ROUTES[id]);
  const navigateSearch = (query) => (location.href = `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`);

  // 设置浮层：没有 options.html，挂载/卸载一个 fixed 容器，复用 SettingsPanel
  let settingsOverlay = null;
  function toggleSettingsOverlay(settings) {
    if (settingsOverlay) {
      settingsOverlay.remove();
      settingsOverlay = null;
      return;
    }
    settingsOverlay = h('<div class="bwl-settings-overlay"></div>');
    settingsOverlay.append(createSettingsPanel(settings));
    settingsOverlay.onclick = (e) => e.target === settingsOverlay && toggleSettingsOverlay(settings);
    document.body.append(settingsOverlay);
  }

  async function main() {
    const settings = createStore({ ...DEFAULT_SETTINGS, ...(await gmStorage.get('settings')).settings });
    settings.subscribeAll((state) => gmStorage.set({ settings: state }));

    // 阶段一：不依赖 document.body 的部分，document-start 就立即跑，越早屏蔽越好
    initUrlCleaner();
    const syncAvBv = (enabled) => (enabled ? enableAvBvSwitch() : disableAvBvSwitch());
    syncAvBv(settings.showAvNumber);
    settings.subscribe('showAvNumber', syncAvBv);

    const applyColorMode = () => {
      const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', settings.colorMode === 'dark' || (settings.colorMode === 'auto' && prefersDark));
    };
    applyColorMode();
    settings.subscribe('colorMode', applyColorMode);

    if (settings.recommendationMode === 'webNoCookie') await loadPersistedState();
    settings.subscribe('recommendationMode', resetForYouState); // 切换模式后旧游标失效，清空重来

    // 阶段二：依赖 document.body 的部分，等 DOM 就绪
    const mountBodyDependent = () => {
      document.documentElement.classList.add('bwl-root');
      initBilibiliCleanup();
      initDanmakuMerge();

      const openSettings = () => toggleSettingsOverlay(settings);
      const topBar = createTopBar({ onSearch: navigateSearch, onOpenSettings: openSettings });
      document.body.append(
        createDock({ onItemClick: (id) => (id === 'settings' ? openSettings() : navigate(id)) }),
        topBar,
      );
      getCurrentUser().then((user) => user && setUserAvatar(topBar, user.avatarUrl)).catch(() => {});
      hasUnreadMessages().then((has) => setNotificationBadge(topBar, has)).catch(() => {});

      // 首页信息流：仅在首页路径挂载，视频页/动态页没有这个网格
      if (location.pathname === '/') {
        const page = document.createElement('div');
        page.className = 'bwl-page';
        page.append(mountFeed(settings));
        document.body.append(page);
      }
    };
    document.body ? mountBodyDependent() : document.addEventListener('DOMContentLoaded', mountBodyDependent, { once: true });
  }

  main();
})();
