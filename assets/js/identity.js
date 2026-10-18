/* Shared progressive enhancement. Public content remains readable without JS. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function notifyCommentTheme() {
    const host = $('.giscus');
    const frame = $('iframe.giscus-frame');
    if (!host || !frame) return;
    const theme = document.documentElement.dataset.theme === 'dark' ? host.dataset.giscusThemeDark : host.dataset.giscusThemeLight;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  }
  function renderThemeControls() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $$('.theme-toggle').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-label', `切换至${dark ? '明亮' : '暗蓝'}模式`);
      button.setAttribute('aria-pressed', String(dark));
      $('use', button).setAttribute('href', dark ? '#i-sun' : '#i-moon');
    });
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0a1426' : '#0B3D91';
    notifyCommentTheme();
  }
  $$('.theme-toggle').forEach(button => button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('ly-theme', next); } catch (_) { /* Themes still work without storage. */ }
    renderThemeControls();
  }));
  renderThemeControls();
  const themeHost = $('.giscus');
  if (themeHost) new MutationObserver(() => {
    const frame = $('iframe', themeHost);
    if (frame && !frame.dataset.themeListener) { frame.dataset.themeListener = 'true'; frame.addEventListener('load', notifyCommentTheme); }
  }).observe(themeHost, { childList: true, subtree: true });

  const menuButton = $('.menu-toggle'), menu = $('#mobile-menu'), header = $('#site-header');
  let inertElements = [];
  function closeMenu(returnFocus = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '打开菜单');
    $('use', menuButton).setAttribute('href', '#i-menu'); document.body.classList.remove('menu-open');
    inertElements.forEach(([element, previous]) => { element.inert = previous; }); inertElements = [];
    if (returnFocus) menuButton.focus();
  }
  if (menuButton && menu) {
    menuButton.hidden = false;
    menuButton.addEventListener('click', () => {
      if (!menu.hidden) { closeMenu(true); return; }
      menu.hidden = false; menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', '关闭菜单');
      $('use', menuButton).setAttribute('href', '#i-close'); document.body.classList.add('menu-open');
      $$('main, .site-footer').forEach(element => { inertElements.push([element, element.inert]); element.inert = true; });
      $('a', menu).focus();
    });
    $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
      if (event.key === 'Tab') {
        const focusable = [menuButton, ...$$('a', menu)];
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
      }
    });
    matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  }
  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', scrollY > 10);
    window.addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
  }
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .05 });
    $$('.reveal').forEach(section => { section.classList.add('will-reveal'); observer.observe(section); });
  }

  const article = $('.article-body'), toc = $('#article-toc-links');
  if (article && toc) {
    $$('h2, h3', article).forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a'); link.href = `#${heading.id}`; link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.classList.add('toc-subheading'); toc.append(link);
    });
    if (toc.children.length) $('.article-toc').hidden = false;
    else $('.article-columns').classList.add('without-toc');
  }

  // The calendar uses dates written in the site's Asia/Shanghai timezone.
  const calendar = $('[data-learning-calendar]'), learningData = $('#learning-data');
  if (calendar && learningData) {
    let entries;
    try { entries = JSON.parse(learningData.textContent); } catch (_) { entries = []; }
    const validEntries = entries.filter(entry => /^\d{4}-\d{2}-\d{2}$/.test(entry.date));
    const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const parseDate = key => { const [year, month, day] = key.split('-').map(Number); return new Date(year, month - 1, day, 12); };
    const keyOf = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    let selected = parseDate(todayKey), month = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    const weekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const entriesByDay = new Map();
    validEntries.forEach(entry => { if (!entriesByDay.has(entry.date)) entriesByDay.set(entry.date, []); entriesByDay.get(entry.date).push(entry); });
    function renderFeed() {
      $('#log-title').replaceChildren(document.createTextNode(`${selected.getMonth() + 1} 月 ${selected.getDate()} 日 `));
      const day = document.createElement('span'); day.textContent = weekdays[selected.getDay()]; $('#log-title').append(day);
      const records = entriesByDay.get(keyOf(selected)) || [], list = $('#log-list'); list.replaceChildren();
      if (!records.length) {
        const empty = document.createElement('div'); empty.className = 'empty-log';
        const title = document.createElement('span'); title.textContent = '这一天，还没有学习记录。';
        const detail = document.createElement('small'); detail.textContent = validEntries.length ? '选择带蓝点的日期，查看当天的收获。' : '新的学习与思考，将在这里慢慢积累。';
        empty.append(title, detail); list.append(empty);
      }
      records.forEach(entry => {
        const item = document.createElement('article'); item.className = 'log-item';
        const time = document.createElement('time'); time.className = 'log-time'; time.textContent = entry.time;
        const text = document.createElement('p'), link = document.createElement('a'); link.textContent = entry.summary || entry.title;
        const destination = new URL(entry.url, location.href);
        if (destination.origin === location.origin && ['http:', 'https:'].includes(destination.protocol)) link.href = destination.href;
        text.append(link);
        const tags = document.createElement('div'); tags.className = 'log-tags';
        (Array.isArray(entry.tags) ? entry.tags : []).forEach(tag => { const span = document.createElement('span'); span.textContent = `# ${tag}`; tags.append(span); });
        item.append(time, text, tags); list.append(item);
      });
      list.scrollTop = 0;
    }
    function renderCalendar(focusKey) {
      $('#calendar-month').textContent = `${month.getFullYear()} 年 ${month.getMonth() + 1} 月`;
      $('#calendar-english').textContent = months[month.getMonth()];
      const offset = (month.getDay() + 6) % 7;
      const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const grid = $('#calendar-grid'); grid.replaceChildren();
      for (let i = 0; i < Math.ceil((offset + days) / 7) * 7; i++) {
        const date = new Date(month.getFullYear(), month.getMonth(), i - offset + 1, 12), key = keyOf(date);
        const button = document.createElement('button'); button.type = 'button'; button.className = 'calendar-day'; button.textContent = date.getDate(); button.dataset.date = key;
        button.classList.toggle('outside', date.getMonth() !== month.getMonth()); button.classList.toggle('has-log', entriesByDay.has(key)); button.classList.toggle('selected', key === keyOf(selected));
        if (key === todayKey) { button.classList.add('today'); button.setAttribute('aria-current', 'date'); }
        button.setAttribute('aria-pressed', String(key === keyOf(selected)));
        button.setAttribute('aria-label', `${key}${entriesByDay.has(key) ? '，有学习记录' : '，暂无记录'}`);
        button.addEventListener('click', () => { selected = date; month = new Date(date.getFullYear(), date.getMonth(), 1, 12); renderCalendar(key); renderFeed(); });
        grid.append(button);
      }
      if (focusKey) $$('.calendar-day').find(button => button.dataset.date === focusKey)?.focus({ preventScroll: true });
    }
    $('#prev-month').addEventListener('click', () => { month.setMonth(month.getMonth() - 1); renderCalendar(); });
    $('#next-month').addEventListener('click', () => { month.setMonth(month.getMonth() + 1); renderCalendar(); });
    $('#calendar-today').addEventListener('click', () => { selected = parseDate(todayKey); month = new Date(selected.getFullYear(), selected.getMonth(), 1, 12); renderCalendar(); renderFeed(); });
    $('.calendar-controls').hidden = false; $('.calendar-interactive').hidden = false; renderCalendar(); renderFeed();
  }

  // An optional server must verify administrator identity. Static Pages has no login.
  const adminEntry = $('[data-session-endpoint]');
  if (adminEntry) {
    const endpoint = new URL(adminEntry.dataset.sessionEndpoint, location.href);
    if (endpoint.origin === location.origin && ['http:', 'https:'].includes(endpoint.protocol)) {
      fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(response => response.ok ? response.json() : null).then(session => {
        if (session?.authenticated === true && session?.is_admin === true) adminEntry.hidden = false;
      }).catch(() => { /* An unavailable session keeps the entry hidden. */ });
    }
  }

  const workspace = $('[data-workspace]'), form = $('#draft-editor');
  if (workspace && form) {
    const feedback = $('#draft-feedback');
    const fields = ['kind','title','date','tags','category','content'];
    const getValues = () => Object.fromEntries(fields.map(field => [field, $(`#draft-${field}`).value]));
    function generateDraft() {
      const values = getValues();
      const slug = values.title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 70) || 'new-note';
      const date = values.date.slice(0, 10), fileName = `${date}-${slug}.md`;
      const tags = values.tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
      const type = values.kind === 'learning' ? 'learning' : values.category;
      const text = `---\ntitle: ${JSON.stringify(values.title)}\ndate: ${values.date.replace('T', ' ')}:00 +0800\ndescription: ${JSON.stringify(values.content.split('\n').find(line => line.trim())?.replace(/^#+\s*/, '').slice(0, 160) || '')}\ntags: ${JSON.stringify(tags)}\nactivity_type: ${JSON.stringify(type)}\n---\n\n${values.content}\n`;
      return { text, fileName, path: `_${values.kind}/${fileName}` };
    }
    function updatePublishLink() {
      const link = $('#publish-draft'), draft = generateDraft();
      const url = new URL(`https://github.com/${workspace.dataset.repository}/new/${workspace.dataset.branch}`);
      url.searchParams.set('filename', draft.path); url.searchParams.set('value', draft.text);
      if (url.href.length < 7500) { link.href = url.href; link.textContent = '在 GitHub 中保存 ↗'; }
      else { link.href = `https://github.com/${workspace.dataset.repository}/upload/${workspace.dataset.branch}`; link.textContent = '先下载，再上传至 GitHub ↗'; }
    }
    const localDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    $('#draft-date').value = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}T${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}`;
    try {
      const saved = JSON.parse(localStorage.getItem('ly-writing-draft') || 'null');
      if (saved && typeof saved === 'object') fields.forEach(field => { if (typeof saved[field] === 'string') $(`#draft-${field}`).value = saved[field]; });
      feedback.textContent = saved ? '已恢复此浏览器保存的草稿。' : '草稿保存在此浏览器，发布前请下载备份。';
    } catch (_) { feedback.textContent = '浏览器存储不可用，可直接下载 Markdown。'; }
    form.addEventListener('input', updatePublishLink);
    $('#draft-kind').addEventListener('change', () => {
      const kind = $('#draft-kind').value;
      if (kind === 'learning') $('#draft-category').value = 'learning';
      else if (kind === 'posts') $('#draft-category').value = 'blog';
      else if (kind === 'experiences') $('#draft-category').value = 'research';
      updatePublishLink();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      try { localStorage.setItem('ly-writing-draft', JSON.stringify(getValues())); feedback.textContent = '草稿已保存到此浏览器，尚未发布。'; }
      catch (_) { feedback.textContent = '无法保存到浏览器，请下载 Markdown 备份。'; }
      updatePublishLink();
    });
    $('#download-draft').addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const draft = generateDraft(), blob = new Blob([draft.text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = draft.fileName; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); feedback.textContent = `已下载，请放入 ${draft.path} 后提交。`;
    });
    $('#publish-draft').addEventListener('click', event => { if (!form.reportValidity()) event.preventDefault(); });
    updatePublishLink();
  }
})();
