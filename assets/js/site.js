(function(){
  var raf = function(fn){
    var q = false;
    return function(){ if (q) return; q = true; requestAnimationFrame(function(){ q = false; fn(); }); };
  };
  var css = function(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); };
  var repaint = [];

  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var base = nav.style.background, baseBorder = nav.style.borderBottomColor;
    var wasPast = null;
    var onScroll = function(){
      var past = window.scrollY > 8;
      if (past === wasPast) return;
      wasPast = past;
      nav.style.background = past ? css('--nav-solid') : base;
      if (baseBorder) nav.style.borderBottomColor = past ? 'rgb(' + css('--ink-rgb') + ' / .18)' : baseBorder;
    };
    onScroll();
    repaint.push(function(){ wasPast = null; onScroll(); });
    window.addEventListener('scroll', raf(onScroll), {passive:true});
  }

  var rail = [].slice.call(document.querySelectorAll('[data-rail]'));
  var sections = [].slice.call(document.querySelectorAll('[data-section]'));
  if (rail.length && sections.length) {
    var tops = [], last = -1;
    var measure = function(){ tops = sections.map(function(s){ return s.offsetTop; }); };
    var sync = function(force){
      var line = window.scrollY + 140, idx = 0;
      tops.forEach(function(t,n){ if (t <= line) idx = n; });
      if (idx === last && force !== true) return;
      last = idx;
      var on = css('--acc'), off = 'rgb(' + css('--ink-rgb') + ' / .42)';
      rail.forEach(function(a,n){ a.style.color = n === idx ? on : off; });
    };
    measure(); sync(true);
    repaint.push(function(){ sync(true); });
    window.addEventListener('scroll', raf(sync), {passive:true});
    window.addEventListener('resize', raf(function(){ measure(); sync(true); }));
  }

  var scheme = window.matchMedia('(prefers-color-scheme: light)');
  var onScheme = function(){ repaint.forEach(function(f){ f(); }); };
  if (scheme.addEventListener) scheme.addEventListener('change', onScheme);
  else if (scheme.addListener) scheme.addListener(onScheme);
})();

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = 'IntersectionObserver' in window ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.setAttribute('data-in','');
      [].slice.call(e.target.querySelectorAll('[data-rule-line]')).forEach(function(l){ l.setAttribute('data-in',''); });
      obs.unobserve(e.target);
    });
  }, {rootMargin: '0px 0px -12% 0px'}) : null;
  var watch = function(el){ if (obs) obs.observe(el); else el.setAttribute('data-in',''); };

  // 1 + 2 + 4: project tiles — hover scale, caption reveal, staggered entrance
  var tiles = [].slice.call(document.querySelectorAll('a')).filter(function(a){
    var first = a.firstElementChild;
    if (!first || first.tagName !== 'DIV') return false;
    var st = first.getAttribute('style') || '';
    return /align-items:flex-end/.test(st) && /border-radius:4px/.test(st + (a.getAttribute('style') || ''));
  });
  var items = [];
  var hasMargin = function(el){ return !!el && /margin-top/.test(el.getAttribute('style') || ''); };
  tiles.forEach(function(a){
    a.setAttribute('data-tile','');

    // caption: the sibling row below the plate, or an inner row when the anchor wraps it
    var cap = a.nextElementSibling;
    if (!hasMargin(cap)) cap = a.lastElementChild;
    if (hasMargin(cap)) {
      cap.setAttribute('data-caption','');
      if (cap.parentElement === a) cap.setAttribute('data-caption-inner','');
    }

    // host: the wrapper only when it belongs to this tile alone, else the anchor itself
    var parent = a.parentElement;
    var host = (parent && parent.querySelectorAll('[data-tile], a').length === 1) ? parent : a;
    if (host.hasAttribute('data-tile-item')) return;
    host.setAttribute('data-tile-item','');
    items.push(host);
    var grid = host.parentElement;
    if (grid) grid.setAttribute('data-grid','');
  });
  if (!reduce) {
    items.forEach(function(el, i){
      el.setAttribute('data-reveal','');
      el.style.transitionDelay = Math.min(i, 5) * 60 + 'ms';
      watch(el);
    });
  }

  // 2b: standalone figures rise in on scroll
  if (!reduce) {
    var sel = 'figure, [style*="url("]';
    [].slice.call(document.querySelectorAll(sel)).forEach(function(f, i){
      if (f.hasAttribute('data-op-img') || f.hasAttribute('data-plate') || f.hasAttribute('data-static')) return;
      var p = f.parentElement;
      if (p && (p.closest('figure') || p.closest('[data-reveal]') || p.closest('[data-op-stage]'))) return;
      if (f.hasAttribute('data-reveal')) return;
      f.setAttribute('data-reveal','');
      f.style.transitionDelay = Math.min(i, 4) * 70 + 'ms';
      watch(f);
    });
  }

  // 3: section rules draw in (host is observed — the 1px line has no area to intersect)
  if (!reduce && obs) {
    [].slice.call(document.querySelectorAll('[style*="1px solid rgb(var(--ink-rgb) / .18)"]')).forEach(function(el){
      var st = el.getAttribute('style') || '';
      var bottom = /border-bottom:1px solid rgb\(var\(--ink-rgb\) \/ \.18\)/.test(st);
      var top = /border-top:1px solid rgb\(var\(--ink-rgb\) \/ \.18\)/.test(st);
      if (!bottom && !top) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      if (bottom) { el.appendChild(mkLine('bottom')); el.style.borderBottomColor = 'transparent'; }
      if (top) { el.appendChild(mkLine('top')); el.style.borderTopColor = 'transparent'; }
      el.setAttribute('data-rule-host','');
      obs.observe(el);
    });
  }
  function mkLine(side){
    var i = document.createElement('i');
    i.setAttribute('data-rule-line','');
    i.style[side] = '-1px';
    return i;
  }

  // 5: directional arrows track their direction
  var wrapArrow = function(el){
    if (el.querySelector('[data-arrow]')) return;
    var html = el.innerHTML, t = el.textContent;
    if (/^\s*←/.test(t)) el.innerHTML = '<i data-arrow="back">←</i>' + html.replace('←', '');
    else if (/→\s*$/.test(t)) el.innerHTML = html.replace('→', '') + '<i data-arrow="fwd">→</i>';
    else if (/↓\s*$/.test(t)) el.innerHTML = html.replace('↓', '') + '<i data-arrow="down">↓</i>';
  };
  [].slice.call(document.querySelectorAll('a')).forEach(function(a){
    var leaves = [].slice.call(a.querySelectorAll('div,span')).filter(function(el){
      return !el.children.length && el.firstChild && /[←→↓]/.test(el.textContent);
    });
    if (leaves.length) leaves.forEach(wrapArrow);
    else if (/[←→↓]/.test(a.textContent) && !a.children.length) wrapArrow(a);
  });
})();

(function(){
  [].slice.call(document.querySelectorAll('[data-other-projects]')).forEach(function(root){
    var rows = [].slice.call(root.querySelectorAll('[data-op-row]'));
    var imgs = [].slice.call(root.querySelectorAll('[data-op-img]'));
    var ink = function(){ return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(); };
    var clear = function(){
      imgs.forEach(function(im){ im.style.opacity = 0; });
      rows.forEach(function(r){ r.style.color = 'rgb(var(--ink-rgb) / .34)'; });
    };
    rows.forEach(function(r){
      var im = root.querySelector('[data-op-img="' + r.getAttribute('data-op-row') + '"]');
      var on = function(){ clear(); if (im) im.style.opacity = 1; r.style.color = ink(); };
      r.addEventListener('mouseenter', on);
      r.addEventListener('focus', on);
    });
    root.addEventListener('mouseleave', clear);
  });
})();


// 6: stable hooks for responsive rules (inline styles get re-serialized at runtime)
(function(){
  [].slice.call(document.querySelectorAll('[style*="gap"]')).forEach(function(el){
    var g = parseInt(getComputedStyle(el).gap, 10);
    if (g) el.setAttribute('data-gap', g);
  });
  [].slice.call(document.querySelectorAll('[style*="grid-template-columns"]')).forEach(function(el){
    var cols = getComputedStyle(el).gridTemplateColumns.split(' ').length;
    if (cols > 1) {
      el.setAttribute('data-cols', cols);
      var first = parseFloat(getComputedStyle(el).gridTemplateColumns.split(' ')[0]);
      if (!(first > 0 && first < 200)) el.setAttribute('data-stack','');
    }
    if (cols === 2 && el.querySelector('h1, h2')) el.setAttribute('data-title-grid','');
  });
  [].slice.call(document.querySelectorAll('[style*="padding"]')).forEach(function(el){
    var s = getComputedStyle(el);
    if (s.paddingLeft === '64px' && s.paddingRight === '64px') el.setAttribute('data-gutter','');
  });
})();
