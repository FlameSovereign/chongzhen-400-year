/* 崇祯四百年谱 · 站点脚本：署名、目录抽屉、竖排、夜间、字号、本篇目录高亮 */
(function () {
  var d = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  /* 署名 */
  var author = (window.SITE && window.SITE.author) || '';
  if (author) {
    var nodes = document.querySelectorAll('[data-author]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = author;
  }

  /* 目录抽屉（窄屏） */
  var menuBtn = document.getElementById('menuBtn'), scrim = document.getElementById('scrim');
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  if (scrim) scrim.addEventListener('click', function () { setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  var tocLinks = document.querySelectorAll('.toc a');
  for (var j = 0; j < tocLinks.length; j++) tocLinks[j].addEventListener('click', function () { setNav(false); });

  /* 夜间 */
  var themeBtn = document.getElementById('themeBtn');
  function isDark() {
    var t = d.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintTheme() { if (themeBtn) { themeBtn.textContent = isDark() ? '昼' : '夜'; themeBtn.setAttribute('aria-pressed', isDark() ? 'true' : 'false'); } }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    d.setAttribute('data-theme', next); put('sx-theme', next); paintTheme();
  });
  paintTheme();

  /* 字号 */
  var sizes = [15, 16, 17, 18, 19, 20, 22];
  function curFs() { return parseInt(getComputedStyle(d).getPropertyValue('--fs'), 10) || 18; }
  function stepFs(dir) {
    var c = curFs(), k = 0;
    for (var i = 0; i < sizes.length; i++) if (Math.abs(sizes[i] - c) < Math.abs(sizes[k] - c)) k = i;
    k = Math.max(0, Math.min(sizes.length - 1, k + dir));
    d.style.setProperty('--fs', sizes[k] + 'px'); put('sx-fs', String(sizes[k]));
  }
  var up = document.getElementById('fsUp'), down = document.getElementById('fsDown');
  if (up) up.addEventListener('click', function () { stepFs(1); });
  if (down) down.addEventListener('click', function () { stepFs(-1); });

  /* 竖排 */
  var modeBtn = document.getElementById('modeBtn'), reader = document.getElementById('reader');
  if (!reader && modeBtn) modeBtn.style.display = 'none';
  function isV() { return d.getAttribute('data-mode') === 'v'; }
  function paintMode() { if (modeBtn) { modeBtn.textContent = isV() ? '横' : '竖'; modeBtn.setAttribute('aria-pressed', isV() ? 'true' : 'false'); } }
  if (reader) {
    var hint = document.createElement('p');
    hint.className = 'vhint'; hint.textContent = '自右向左读 · 滚轮或左右滑动翻行';
    reader.parentNode.insertBefore(hint, reader.nextSibling);
    reader.addEventListener('wheel', function (e) {
      if (!isV()) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { reader.scrollLeft -= e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }
  if (modeBtn) modeBtn.addEventListener('click', function () {
    if (isV()) { d.removeAttribute('data-mode'); put('sx-mode', null); }
    else { d.setAttribute('data-mode', 'v'); put('sx-mode', 'v'); window.scrollTo(0, 0); if (reader) reader.scrollLeft = 0; }
    paintMode();
  });
  paintMode();

  /* 本篇目录高亮（横排时） */
  var heads = document.querySelectorAll('.art-body h2[id]');
  if (heads.length && 'IntersectionObserver' in window) {
    var map = {};
    for (var m = 0; m < tocLinks.length; m++) map[tocLinks[m].getAttribute('href').slice(1)] = tocLinks[m];
    var io = new IntersectionObserver(function (entries) {
      if (isV()) return;
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          for (var k in map) map[k].classList.remove('here');
          map[en.target.id].classList.add('here');
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    for (var h = 0; h < heads.length; h++) io.observe(heads[h]);
  }
})();
