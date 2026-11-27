(function () {
  'use strict';

  var CLARITY_PROJECT = 'xm3hw0zsli';
  var STORAGE_KEY = 'suavan_consent_analytics';
  var POLICY_URL = '/privacidade/';

  var currentScript = document.currentScript;
  var PAGE_STYLED = !!currentScript && currentScript.getAttribute('data-banner-style') === 'page';

  var IS_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

  function queueStub() { (queueStub.q = queueStub.q || []).push(arguments); }
  if (typeof window.clarity !== 'function') { window.clarity = queueStub; window.clarity.q = queueStub.q = []; }

  function readChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  function loadClarity() {
    if (IS_LOCAL) { logLocally(); return; }
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT);
    window.clarity('consent');
  }

  function logLocally() {
    var queued = window.clarity.q || [];
    window.clarity = function () {
      console.info('[Clarity em teste local, nada é enviado]', Array.prototype.slice.call(arguments).join(' '));
    };
    queued.forEach(function (args) { window.clarity.apply(null, args); });
    window.clarity('consent');
  }

  function dropQueue() {
    window.clarity = function () {};
  }

  function removeBanner(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function setStyle(el, rules) {
    if (!PAGE_STYLED) el.style.cssText = rules.join(';');
  }

  function showBanner() {
    var wrap = document.createElement('div');
    wrap.className = 'consent-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Aviso sobre análise de uso');
    setStyle(wrap, [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:9999',
      'background:#111827', 'color:#E5E7EB',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif',
      'font-size:14px', 'line-height:1.6',
      'padding:16px 20px', 'box-shadow:0 -2px 16px rgba(0,0,0,.25)'
    ]);

    var inner = document.createElement('div');
    inner.className = 'consent-banner-inner';
    setStyle(inner, [
      'max-width:960px', 'margin:0 auto', 'display:flex',
      'gap:16px', 'align-items:center', 'flex-wrap:wrap',
      'justify-content:space-between'
    ]);

    var text = document.createElement('div');
    text.className = 'consent-banner-text';
    setStyle(text, ['flex:1 1 320px', 'min-width:260px']);
    text.innerHTML =
      'Usamos uma ferramenta de análise para entender como o site é usado e ' +
      'melhorá-lo. <strong>Ela só é ativada se você aceitar.</strong> ' +
      '<a class="consent-banner-link" href="' + POLICY_URL + '" target="_blank" rel="noopener"' +
      (PAGE_STYLED ? '' : ' style="color:#FACC15;text-decoration:underline"') + '>' +
      'Política de Privacidade</a>';

    var actions = document.createElement('div');
    actions.className = 'consent-banner-actions';
    setStyle(actions, ['display:flex', 'gap:10px', 'flex-shrink:0']);

    function makeButton(label, primary) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'consent-banner-button ' + (primary ? 'consent-banner-accept' : 'consent-banner-decline');
      b.textContent = label;
      setStyle(b, [
        'font-family:inherit', 'font-size:14px', 'font-weight:600',
        'padding:10px 18px', 'border-radius:8px', 'cursor:pointer',
        'border:' + (primary ? 'none' : '1px solid #4B5563'),
        'background:' + (primary ? '#FFC500' : 'transparent'),
        'color:' + (primary ? '#111827' : '#E5E7EB')
      ]);
      return b;
    }

    var no = makeButton('Recusar', false);
    var yes = makeButton('Aceitar', true);

    no.addEventListener('click', function () {
      saveChoice('declined');
      removeBanner(wrap);
      dropQueue();
    });

    yes.addEventListener('click', function () {
      saveChoice('accepted');
      removeBanner(wrap);
      loadClarity();
    });

    actions.appendChild(no);
    actions.appendChild(yes);
    inner.appendChild(text);
    inner.appendChild(actions);
    wrap.appendChild(inner);

    function attach() { document.body.appendChild(wrap); }
    if (document.body) attach();
    else document.addEventListener('DOMContentLoaded', attach);
  }

  var choice = readChoice();
  if (choice === 'accepted') {
    loadClarity();
  } else if (choice === 'declined') {
    dropQueue();
  } else {
    showBanner();
  }
})();
