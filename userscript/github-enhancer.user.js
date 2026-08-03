// ==UserScript==
// @name         GitHub Enhancer
// @name:zh-CN   GitHub 增强
// @namespace    https://github.com/asong56/userscript
// @version      1.1.0
// @description  GitHub quality-of-life bundle: hides Copilot upsells, adds copy-raw-URL/download buttons to file rows, colors files by type, and adds a folder-download button.
// @description:zh-CN GitHub 体验增强：隐藏 Copilot 推广、为文件行添加复制/下载按钮、按类型给文件名上色、新增文件夹下载按钮
// @author       asong56
// @match        https://github.com/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/asong56/userscript
// @supportURL   https://github.com/asong56/userscript/issues
// @downloadURL  https://raw.githubusercontent.com/asong56/userscript/main/github-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/asong56/userscript/main/github-enhancer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const FEATURES = {
    noCopilot: true,
    copyRawUrl: true,
    fileListBeautify: true,
    folderDownloader: true,
  };

  // 单一共享 MutationObserver，各模块把处理函数注册进来，统一节流触发
  const registeredHandlers = [];
  let scheduled = false;

  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    // rAF 节流：DOM 真正变化后的下一帧只跑一次
    requestAnimationFrame(() => {
      scheduled = false;
      for (const fn of registeredHandlers) {
        try {
          fn();
        } catch (e) {
          console.error('[GitHub Enhancer] handler error:', e);
        }
      }
    });
  }

  function registerDomHandler(fn) {
    registeredHandlers.push(fn);
  }

  // 共享工具：注入一段 CSS
  function injectCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  }

  // 判断文件列表行是"文件"还是"文件夹"：优先用 /blob/ vs /tree/ 路由判断
  // （比图标 class 名更稳定），图标 class 仅作兜底
  function getFileLink(rowEl) {
    return rowEl.querySelector('a[href*="/blob/"], a[href*="/tree/"]');
  }

  function isFolderRow(rowEl) {
    const link = getFileLink(rowEl);
    if (link) return link.href.includes('/tree/');

    const icon = rowEl.querySelector('svg');
    if (!icon) return false;
    return (
      icon.classList.contains('octicon-file-directory-fill') ||
      icon.classList.contains('icon-directory')
    );
  }

  const sharedObserver = new MutationObserver(scheduleRun);
  sharedObserver.observe(document.body, { childList: true, subtree: true });

  // SPA 路由变化：用 GitHub 自带的 turbo/pjax 事件，而非额外起一个 observer 猜测
  document.addEventListener('turbo:render', scheduleRun);
  document.addEventListener('pjax:end', scheduleRun);
  window.addEventListener('popstate', scheduleRun);

  scheduleRun();

  // 模块一：隐藏 Copilot 入口。纯结构元素用 CSS 隐藏（零 JS 开销）；
  // 需按文本内容判断的场景才用 JS + WeakSet 去重，避免每次 DOM 变化全量重扫
  if (FEATURES.noCopilot) {
    injectCSS(`
      h2.my-2,
      #dashboard > div > div.copilotPreview__container > copilot-dashboard-entrypoint,
      .copilotPreview__container,
      .copilot-dashboard-entrypoint,
      a[data-analytics-event*="COPILOT"],
      a[href="/settings/copilot"],
      li[role="menuitem"].prc-ActionList-ActionListItem-uq6I7,
      #repos-sticky-header [class*="ButtonGroup"],
      .AppHeader-CopilotChat {
        display: none !important;
      }
    `);

    const checkedNodes = new WeakSet();

    // 按选择器查找元素，文本内容匹配则移除；每个节点只判断一次
    function removeIfTextMatches(selector, matchText) {
      document.querySelectorAll(selector).forEach((el) => {
        if (checkedNodes.has(el)) return;
        checkedNodes.add(el);
        if (el.textContent.includes(matchText)) el.remove();
      });
    }

    function removeCopilotTextMatches() {
      removeIfTextMatches('div[data-testid="sidebar-section"]', 'Development');
      removeIfTextMatches('.flash-messages .flash-warn', 'Copilot');

      const flash = document.querySelector('.flash-messages');
      if (flash && !flash.children.length) flash.remove();
    }

    registerDomHandler(removeCopilotTextMatches);
  }

  // 模块二：文件列表每行加"复制 raw 链接/下载"按钮，图标颜色跟随 Primer 变量
  if (FEATURES.copyRawUrl) {
    injectCSS(`
      .gh-enhancer-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 8px;
        color: var(--fgColor-muted, #656d76);
        cursor: pointer;
        border-radius: 6px;
        padding: 2px;
        background: none;
        border: none;
        font: inherit;
      }
      .gh-enhancer-action-btn:hover {
        color: var(--fgColor-default, #1f2328);
        background: var(--bgColor-neutral-muted, rgba(175,184,193,0.2));
      }
      .gh-enhancer-action-btn:focus-visible {
        outline: 2px solid var(--fgColor-accent, #0969da);
        outline-offset: 1px;
      }
    `);

    const COPY_ICON_SVG = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"><path fill="currentColor" fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill="currentColor" fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>`;
    const DOWNLOAD_ICON_SVG = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"><path fill="currentColor" fill-rule="evenodd" d="M1.75 14.25A1.75 1.75 0 013.5 12.5h9a1.75 1.75 0 011.75 1.75v1.5a.75.75 0 01-.75.75H2.5a.75.75 0 01-.75-.75v-1.5zM10.75 9.25a.25.25 0 01.25.25v2.5a.25.25 0 01-.25.25H5.25a.25.25 0 01-.25-.25v-2.5a.25.25 0 01.25-.25h5.5zM8 1.75a.25.25 0 01.25.25v7.5a.25.25 0 01-.25.25H6.75a.25.25 0 01-.25-.25v-7.5a.25.25 0 01.25-.25h1.5zM10.25 5.25l1.5 1.5a.25.25 0 01.35 0l3-3a.25.25 0 00-.35-.35L11 5.25 9.25 3.5a.25.25 0 00-.35.35z"></path></svg>`;

    function getFilenameFromUrl(url) {
      let pathname;
      try { pathname = new URL(url).pathname; } catch { pathname = url; } // 用 URL API 取纯路径，避免查询参数混入文件名
      const last = pathname.substring(pathname.lastIndexOf('/') + 1);
      return last ? decodeURIComponent(last).replace(/ /g, '_') : 'download';
    }

    async function downloadRawFile(url, triggerBtn) {
      const originalTitle = triggerBtn && triggerBtn.title;
      try {
        if (triggerBtn) {
          triggerBtn.title = 'Downloading…';
          triggerBtn.setAttribute('aria-busy', 'true');
          triggerBtn.style.opacity = '0.5';
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = getFilenameFromUrl(url);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        console.error('[GitHub Enhancer] 下载失败:', url, e);
      } finally {
        if (triggerBtn) {
          triggerBtn.title = originalTitle;
          triggerBtn.removeAttribute('aria-busy');
          triggerBtn.style.opacity = '';
        }
      }
    }

    // 用真正的 <button> 而非 div+role 模拟，天然支持键盘操作，无需额外 ARIA role
    function makeActionButton(svg, title, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gh-enhancer-action-btn';
      btn.innerHTML = svg;
      btn.title = title;
      btn.setAttribute('aria-label', title);
      btn.addEventListener('click', (e) => onClick(e.currentTarget));
      return btn;
    }

    const copyToClipboard = (text) =>
      navigator.clipboard.writeText(text).catch((e) => console.error('[GitHub Enhancer] 复制失败:', e));

    function addButtonsToFileList() {
      const rows = document.querySelectorAll(
        'table tbody tr:not(.cp-btn-rdy), div[role="row"]:not(.cp-btn-rdy)'
      );
      rows.forEach((row) => {
        row.classList.add('cp-btn-rdy');
        if (isFolderRow(row)) return; // 文件夹行跳过

        const link = getFileLink(row);
        if (!link) return; // 既非文件也非文件夹的行（如表头），跳过

        const rawUrl = link.href.replace('/blob/', '/raw/');
        const cell = row.querySelector('td:last-child, [role="gridcell"]:last-child') || row;
        cell.style.display = 'flex';
        cell.style.justifyContent = 'flex-end';
        cell.appendChild(
          makeActionButton(COPY_ICON_SVG, 'Copy raw file url', () => copyToClipboard(rawUrl))
        );
        cell.appendChild(
          makeActionButton(DOWNLOAD_ICON_SVG, 'Download raw file', (btn) => downloadRawFile(rawUrl, btn))
        );
      });
    }

    registerDomHandler(addButtonsToFileList);
  }

  // 模块三：按文件类型分类上色（低饱和度莫兰迪色系）。固定静态映射表，
  // 无网络请求；颜色用 CSS 变量 + prefers-color-scheme 自动切换明暗
  if (FEATURES.fileListBeautify) {
    const BEAUTIFY_MARK = Symbol('gh-enhancer-beautify-mark');

    // 扩展名 -> 分类
    const EXT_CATEGORY = {
      // Web 三件套
      html: 'web', htm: 'web', css: 'web', scss: 'web', sass: 'web', less: 'web',
      js: 'web', jsx: 'web', ts: 'web', tsx: 'web', vue: 'web', svelte: 'web',
      // 编程语言
      py: 'lang', go: 'lang', rs: 'lang', java: 'lang', kt: 'lang', c: 'lang',
      h: 'lang', cpp: 'lang', hpp: 'lang', cs: 'lang', rb: 'lang', php: 'lang',
      swift: 'lang', sh: 'lang', bash: 'lang',
      // 配置/数据
      json: 'config', yaml: 'config', yml: 'config', toml: 'config',
      xml: 'config', ini: 'config', env: 'config', lock: 'config',
      // 文档
      md: 'doc', markdown: 'doc', txt: 'doc', rst: 'doc',
      // 图片
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
      svg: 'image', ico: 'image', bmp: 'image', webp: 'image',
    };

    const CATEGORIES = ['web', 'lang', 'config', 'doc', 'image', 'other'];
    const categoryColorRules = CATEGORIES.map(
      (c) => `a[file-type="${c}"] { color: var(--gh-enhancer-color-${c}) !important; }`
    ).join('\n      ');

    injectCSS(`
      :root {
        --gh-enhancer-color-web: #a8623f;
        --gh-enhancer-color-lang: #4d7a6e;
        --gh-enhancer-color-config: #7a6a4d;
        --gh-enhancer-color-doc: #5c6b8a;
        --gh-enhancer-color-image: #7a5c7a;
        --gh-enhancer-color-other: #6e6e68;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --gh-enhancer-color-web: #d99a7c;
          --gh-enhancer-color-lang: #8fc4b3;
          --gh-enhancer-color-config: #c4ad7c;
          --gh-enhancer-color-doc: #9fb0d9;
          --gh-enhancer-color-image: #c49fc4;
          --gh-enhancer-color-other: #a3a39c;
        }
      }
      ${categoryColorRules}
      a[file-type=":folder"] { font-weight: 600 !important; }
    `);

    function beautifyFileList() {
      for (const el of document.querySelectorAll('.react-directory-truncate, .js-navigation-open')) {
        if (el[BEAUTIFY_MARK]) continue;
        el[BEAUTIFY_MARK] = true;

        // 新旧两版 GitHub DOM 结构：新版用 td 容器，旧版用 js-navigation-item
        const isOld = el.tagName === 'A';
        const a = isOld ? el : el.getElementsByTagName('a')[0];
        const url = a && a.href;
        if (!url) continue;

        const rowContainer = el.closest(isOld ? '.js-navigation-item' : 'td');
        if (!rowContainer) continue;

        let isFolder;
        if (url.includes('/tree/')) isFolder = true;
        else if (url.includes('/blob/')) isFolder = false;
        else isFolder = isFolderRow(rowContainer); // 兜底：URL 不含标准路由时退回图标 class 名判断

        if (isFolder) {
          a.setAttribute('file-type', ':folder');
          continue;
        }

        const filename = url.split('/').pop().toLowerCase();
        const ext = (filename.match(/\.(\w+)$/) || [])[1] || '';
        a.setAttribute('file-type', EXT_CATEGORY[ext] || 'other');
      }
    }

    registerDomHandler(beautifyFileList);
  }

  // 模块四：插入"下载文件夹"按钮，跳转第三方打包服务（脚本自身不发起批量请求）
  if (FEATURES.folderDownloader) {
    const DL_CLASS = 'gh-enhancer-folder-download';
    const WIDE_LAYOUT_BREAKPOINT = 1200;
    const DOWNLOAD_DIRECTORY_URL = (url) => `https://download-directory.github.io?url=${url}`;
    const DOWNGIT_URL = (url) => `https://downgit.github.io/#/home?url=${url}`;

    function buildDropdownLinks(url) {
      return `
        <li class="${DL_CLASS}">
          <p style="padding:0px 8px 2px 10px; color:grey; margin:0; font-size:10px;">Download folder with..</p>
        </li>
        <a class="dropdown-item" target="_blank" rel="noopener" href="${DOWNLOAD_DIRECTORY_URL(url)}">
          download-directory
        </a>
        <a class="dropdown-item" target="_blank" rel="noopener" href="${DOWNGIT_URL(url)}">
          DownGit
        </a>
        <li class="d-block d-md-none dropdown-divider ${DL_CLASS}" role="none"></li>`;
    }

    function buildWideButton(url) {
      const link = (href, label) =>
        `<li class="Box-row Box-row--hover-gray p-3 mt-0"><a class="d-flex flex-items-center color-text-primary text-bold no-underline" rel="noopener" target="_blank" href="${href}">${label}</a></li>`;
      return `
        <details data-view-component="true" class="details-overlay details-reset position-relative mr-2 ${DL_CLASS}">
          <summary role="button" data-view-component="true">
            <span class="btn d-none d-md-flex flex-items-center">
              Download folder
              <span class="dropdown-caret ml-1"></span>
            </span>
          </summary>
          <div class="dropdown-menu dropdown-menu-sw" style="top:32px;width:220px;">
            <ul class="list-style-none">
              ${link(DOWNLOAD_DIRECTORY_URL(url), 'With download-directory')}
              ${link(DOWNGIT_URL(url), 'With DownGit')}
            </ul>
          </div>
        </details>`;
    }

    // 复制路径图标只在文件夹页出现，用它判断当前是否在文件夹视图内
    function isInsideFolderView() {
      return !!document.querySelector('.octicon.octicon-copy');
    }

    const removeExistingButton = () =>
      document.querySelectorAll(`.${DL_CLASS}`).forEach((el) => el.remove());

    function injectFolderDownloadButton() {
      const shouldShow = isInsideFolderView();
      const existing = document.querySelector(`.${DL_CLASS}`);

      if (!shouldShow) {
        // 不在文件夹视图，若还残留按钮才清理；否则什么都不做
        if (existing) removeExistingButton();
        return;
      }

      const isWide = document.body.clientWidth > WIDE_LAYOUT_BREAKPOINT;
      const currentLayout = existing && existing.dataset.ghLayout;
      const currentUrl = existing && existing.dataset.ghUrl;
      const targetLayout = isWide ? 'wide' : 'dropdown';
      const url = window.location.href;

      // 布局和 URL 都没变、按钮还在，跳过——避免用户刚点开的下拉菜单被强制关闭
      if (existing && currentLayout === targetLayout && currentUrl === url) return;

      removeExistingButton();

      if (isWide) {
        const anchor = document.querySelector('[data-testid="tree-overflow-menu-anchor"]');
        if (anchor) anchor.insertAdjacentHTML('beforebegin', buildWideButton(url));
      } else {
        const menu = document.querySelector('#__primerPortalRoot__ ul[role="menu"]');
        if (menu) menu.insertAdjacentHTML('beforeend', buildDropdownLinks(url));
      }

      const inserted = document.querySelector(`.${DL_CLASS}`);
      if (inserted) {
        inserted.dataset.ghLayout = targetLayout;
        inserted.dataset.ghUrl = url;
      }
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(injectFolderDownloadButton, 150);
    });

    registerDomHandler(injectFolderDownloadButton);
  }
})();
