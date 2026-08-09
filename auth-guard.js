/* ==========================================================================
   auth-guard.js
   ==========================================================================
   Bloqueia toda a página até a pessoa entrar com uma conta Google que
   esteja na lista ALLOWED_EMAILS (definida em auth-config.js).

   Carregar em TODAS as páginas do site, sempre depois de:
     firebase-app-compat.js, firebase-auth-compat.js,
     firebase-config.js, auth-config.js
   e sempre ANTES de script.js.

   Quando o login é aprovado, dispara o evento "painel:auth-ready" no
   window e guarda o usuário em window.__PAINEL_AUTH_USER__, que o
   script.js usa para só então iniciar o resto do site.
   ========================================================================== */

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // Trava o conteúdo da página imediatamente (CSS em site.css cuida de
    // esconder .app-shell e .home-wrap enquanto essa classe existir).
    document.body.classList.add("auth-locked");

    const gate = document.createElement("div");
    gate.id = "auth-gate";
    gate.innerHTML = `
      <div class="auth-card">
        <div class="auth-brand-mark"></div>
        <h1>Painel do Curso</h1>

        <p class="auth-step auth-step-checking">Verificando sua conta…</p>

        <div class="auth-step auth-step-login" style="display:none;">
          <p>Entre com uma conta Google autorizada para acessar o painel.</p>
          <button type="button" class="btn btn-primary auth-google-btn">
            <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.2-5.6l-6.6-5.4C29.6 34.9 26.9 36 24 36c-5.3 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.3-5.4 6.9l6.6 5.4C39.9 38 44 32 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            <span>Entrar com Google</span>
          </button>
          <span class="auth-error"></span>
        </div>

        <div class="auth-step auth-step-denied" style="display:none;">
          <p>A conta <b class="auth-denied-email"></b> não tem acesso a este painel.</p>
          <button type="button" class="btn auth-signout-btn">Tentar com outra conta</button>
        </div>
      </div>
    `;
    document.body.appendChild(gate);

    const checkingEl = gate.querySelector(".auth-step-checking");
    const loginEl = gate.querySelector(".auth-step-login");
    const deniedEl = gate.querySelector(".auth-step-denied");
    const errorEl = gate.querySelector(".auth-error");

    function showLogin(msg) {
      checkingEl.style.display = "none";
      deniedEl.style.display = "none";
      loginEl.style.display = "";
      errorEl.textContent = msg || "";
    }

    if (typeof firebase === "undefined" || typeof firebase.auth !== "function") {
      showLogin("Erro de configuração: firebase-auth-compat.js não foi carregado nesta página.");
      return;
    }
    if (typeof ALLOWED_EMAILS === "undefined") {
      showLogin("Erro de configuração: auth-config.js não foi carregado nesta página.");
      return;
    }
    if (typeof firebaseConfig === "undefined") {
      showLogin("Erro de configuração: firebase-config.js não foi carregado nesta página.");
      return;
    }

    // O script.js normalmente é quem inicializa o Firebase App, mas ele só
    // carrega DEPOIS deste arquivo — então inicializamos aqui se ainda não
    // tiver sido feito, pra poder usar o Auth já de cara.
    if (!firebase.apps || !firebase.apps.length) {
      try {
        firebase.initializeApp(firebaseConfig);
      } catch (err) {
        console.error(err);
        showLogin("Erro ao inicializar o Firebase. Confira o firebase-config.js.");
        return;
      }
    }

    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    gate.querySelector(".auth-google-btn").addEventListener("click", function () {
      errorEl.textContent = "";
      auth.signInWithPopup(provider).catch(function (err) {
        console.error(err);
        errorEl.textContent = "Não foi possível entrar. Tente novamente.";
      });
    });

    gate.querySelector(".auth-signout-btn").addEventListener("click", function () {
      auth.signOut();
    });

    auth.onAuthStateChanged(function (user) {
      checkingEl.style.display = "none";

      if (!user) {
        showLogin();
        return;
      }

      const email = (user.email || "").toLowerCase();
      const allowed = ALLOWED_EMAILS.map((e) => e.toLowerCase());

      if (allowed.indexOf(email) === -1) {
        loginEl.style.display = "none";
        deniedEl.style.display = "";
        deniedEl.querySelector(".auth-denied-email").textContent = user.email || "";
        return;
      }

      // Autorizado: libera a página.
      document.body.classList.remove("auth-locked");
      gate.classList.add("gate-hidden");
      window.__PAINEL_AUTH_USER__ = user;
      window.dispatchEvent(new CustomEvent("painel:auth-ready", { detail: { user } }));
    });
  });
})();
