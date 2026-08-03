/* Sua Van — consentimento de análise de uso (Microsoft Clarity).
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * Até 03/08/2026 o script do Clarity ficava direto no <head> dos três sites e
 * começava a gravar a sessão no primeiro milissegundo, sem perguntar nada — em
 * `pais.` isso incluía um formulário com nome, WhatsApp e A ESCOLA DO FILHO,
 * dado que identifica um menor indiretamente.
 *
 * Análise de uso e replay de sessão são finalidade NÃO-ESSENCIAL. Sob a LGPD
 * isso pede **opt-in**: nada é carregado antes do aceite. Recusar não é
 * "desligar depois" — o script simplesmente nunca entra na página.
 *
 * É a mesma lógica que, corretamente, manteve o Clarity FORA do
 * `cadastro.suavan.com.br` desde o início. Ela só não tinha voltado para cá.
 *
 * ⚠️ THIS FILE IS DUPLICATED nos 3 repos (suavan-site, suavan-pais,
 * suavan-motorista), porque cada um é um GitHub Pages próprio, num subdomínio
 * próprio. Servir de um só criaria dependência cross-origin justamente na peça
 * de privacidade. **Ao alterar, alterar nos três.**
 */
(function () {
  'use strict';

  var CLARITY_PROJECT = 'xm3hw0zsli';
  var STORAGE_KEY = 'suavan_consent_analytics'; // 'accepted' | 'declined'
  var POLICY_URL = 'https://suavan.com.br/privacidade';

  /* Leitura/escrita tolerantes: navegação privativa e bloqueio de cookies
     fazem localStorage lançar. Falhar aqui não pode quebrar a página — e, na
     dúvida, o padrão é NÃO rastrear. */
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
    } catch (e) {
      /* Sem persistência, a escolha vale só para esta visita. Melhor isso do
         que quebrar, e melhor perguntar de novo do que assumir consentimento. */
    }
  }

  /* Snippet oficial do Clarity, inalterado — só passou a rodar sob demanda. */
  function loadClarity() {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT);
  }

  function removeBanner(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function showBanner() {
    var wrap = document.createElement('div');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Aviso sobre análise de uso');
    wrap.style.cssText = [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:9999',
      'background:#111827', 'color:#E5E7EB',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif',
      'font-size:14px', 'line-height:1.6',
      'padding:16px 20px', 'box-shadow:0 -2px 16px rgba(0,0,0,.25)'
    ].join(';');

    var inner = document.createElement('div');
    inner.style.cssText = [
      'max-width:960px', 'margin:0 auto', 'display:flex',
      'gap:16px', 'align-items:center', 'flex-wrap:wrap',
      'justify-content:space-between'
    ].join(';');

    var text = document.createElement('div');
    text.style.cssText = 'flex:1 1 320px;min-width:260px';
    text.innerHTML =
      'Usamos uma ferramenta de análise para entender como o site é usado e ' +
      'melhorá-lo. <strong>Ela só é ativada se você aceitar.</strong> ' +
      '<a href="' + POLICY_URL + '" style="color:#FACC15;text-decoration:underline">' +
      'Política de Privacidade</a>';

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-shrink:0';

    function makeButton(label, primary) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = [
        'font-family:inherit', 'font-size:14px', 'font-weight:600',
        'padding:10px 18px', 'border-radius:8px', 'cursor:pointer',
        'border:' + (primary ? 'none' : '1px solid #4B5563'),
        'background:' + (primary ? '#FFC500' : 'transparent'),
        'color:' + (primary ? '#111827' : '#E5E7EB')
      ].join(';');
      return b;
    }

    /* "Recusar" vem primeiro na ordem do DOM de propósito: a opção que
       preserva a privacidade não deve ser a mais escondida nem a mais difícil
       de alcançar por teclado. */
    var no = makeButton('Recusar', false);
    var yes = makeButton('Aceitar', true);

    no.addEventListener('click', function () {
      saveChoice('declined');
      removeBanner(wrap);
      /* Nada a desligar: o Clarity nunca foi carregado. */
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
  } else if (choice !== 'declined') {
    /* Sem escolha registrada: pergunta. Enquanto não houver aceite, nada é
       carregado — o estado inicial é "não rastrear". */
    showBanner();
  }
})();
