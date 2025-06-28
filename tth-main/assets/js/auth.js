// Sistema de Autenticação

class AuthManager {
  constructor() {
    this.userId = null;
    this.userEmail = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.checkExistingLogin();
    this.bindEvents();
  }

  // Verificar login existente
  checkExistingLogin() {
    const savedUserId = Utils.CookieManager.get(CONFIG.COOKIES.USER_ID);
    const savedEmail = Utils.CookieManager.get(CONFIG.COOKIES.USER_EMAIL);
    
    if (savedUserId && savedEmail) {
      this.userId = savedUserId;
      this.userEmail = savedEmail;
      this.isAuthenticated = true;
      this.hideLoginPopup();
      Utils.NotificationManager.success(`Bem-vindo de volta, ${this.userEmail}!`);
      return true;
    }
    return false;
  }

  // Login
  async login(email, password) {
    if (!Utils.Validator.email(email)) {
      throw new Error('E-mail inválido');
    }

    if (!Utils.Validator.password(password)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      const response = await fetch(CONFIG.WEBHOOKS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        this.userId = result.userId;
        this.userEmail = email;
        this.isAuthenticated = true;
        
        // Salvar cookies
        Utils.CookieManager.set(CONFIG.COOKIES.USER_ID, this.userId, CONFIG.CACHE.USER_SESSION_DAYS);
        Utils.CookieManager.set(CONFIG.COOKIES.USER_EMAIL, email, CONFIG.CACHE.USER_SESSION_DAYS);
        
        this.hideLoginPopup();
        Utils.NotificationManager.success('Login realizado com sucesso!');
        
        // Focar no campo de busca
        setTimeout(() => {
          const keywordInput = document.getElementById('keyword');
          if (keywordInput) keywordInput.focus();
        }, 300);
        
        return true;
      } else {
        throw new Error(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro ao conectar. Verifique sua internet.');
    }
  }

  // Logout
  logout() {
    this.userId = null;
    this.userEmail = null;
    this.isAuthenticated = false;
    
    // Limpar cookies
    Utils.CookieManager.delete(CONFIG.COOKIES.USER_ID);
    Utils.CookieManager.delete(CONFIG.COOKIES.USER_EMAIL);
    
    // Limpar dados da sessão
    Utils.CacheManager.delete('currentSearch');
    Utils.CacheManager.delete('videosData');
    
    this.showLoginPopup();
    Utils.NotificationManager.info('Logout realizado com sucesso');
  }

  // Recuperação de senha
  async recoverPassword(email) {
    if (!Utils.Validator.email(email)) {
      throw new Error('E-mail inválido');
    }

    try {
      const response = await fetch(CONFIG.WEBHOOKS.RECOVERY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        Utils.NotificationManager.success('Link de recuperação enviado! Verifique seu e-mail.');
        return true;
      } else {
        throw new Error(result.message || 'Erro ao enviar link de recuperação');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro ao conectar. Tente novamente.');
    }
  }

  // Mostrar popup de login
  showLoginPopup() {
    const popup = document.getElementById('loginPopup');
    if (popup) {
      popup.style.display = 'flex';
      Utils.DOMUtils.fadeIn(popup);
      document.getElementById('email').focus();
    }
  }

  // Ocultar popup de login
  hideLoginPopup() {
    const popup = document.getElementById('loginPopup');
    if (popup) {
      Utils.DOMUtils.fadeOut(popup, () => {
        popup.style.display = 'none';
      });
    }
  }

  // Mostrar popup de recuperação
  showRecoveryPopup() {
    const popup = document.getElementById('recoveryPopup');
    if (popup) {
      popup.style.display = 'flex';
      Utils.DOMUtils.fadeIn(popup);
      document.getElementById('recoveryEmail').focus();
    }
  }

  // Ocultar popup de recuperação
  hideRecoveryPopup() {
    const popup = document.getElementById('recoveryPopup');
    if (popup) {
      Utils.DOMUtils.fadeOut(popup, () => {
        popup.style.display = 'none';
        this.clearRecoveryForm();
      });
    }
  }

  // Limpar formulário de recuperação
  clearRecoveryForm() {
    const emailInput = document.getElementById('recoveryEmail');
    const messageEl = document.getElementById('recoveryMessage');
    const errorEl = document.getElementById('recoveryError');
    
    if (emailInput) emailInput.value = '';
    if (messageEl) Utils.DOMUtils.removeClass(messageEl, 'show');
    if (errorEl) Utils.DOMUtils.removeClass(errorEl, 'show');
  }

  // Adicionar botão de logout
  addLogoutButton() {
    if (this.isAuthenticated) {
      const headerActions = document.querySelector('.header-actions');
      if (headerActions && !document.querySelector('.logout-btn')) {
        const logoutBtn = Utils.DOMUtils.createElement('button', 'logout-btn', 'Sair');
        
        logoutBtn.addEventListener('click', () => this.logout());
        logoutBtn.addEventListener('mouseenter', () => {
          logoutBtn.style.transform = 'translateY(-2px)';
          logoutBtn.style.boxShadow = 'var(--shadow-secondary)';
        });
        logoutBtn.addEventListener('mouseleave', () => {
          logoutBtn.style.transform = 'translateY(0)';
          logoutBtn.style.boxShadow = 'var(--shadow-primary)';
        });
        
        headerActions.appendChild(logoutBtn);
      }
    }
  }

  // Bind de eventos
  bindEvents() {
    // Login button
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
      loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');
        
        // Limpar erro anterior
        Utils.DOMUtils.removeClass(loginError, 'show');
        loginError.textContent = '';
        
        // Validar campos
        if (!Utils.Validator.required(email) || !Utils.Validator.required(password)) {
          loginError.textContent = 'Por favor, preencha todos os campos';
          Utils.DOMUtils.addClass(loginError, 'show');
          return;
        }
        
        // Desabilitar botão
        loginBtn.disabled = true;
        loginBtn.textContent = 'Entrando...';
        
        try {
          await this.login(email, password);
          this.addLogoutButton();
        } catch (error) {
          loginError.textContent = error.message;
          Utils.DOMUtils.addClass(loginError, 'show');
        } finally {
          loginBtn.disabled = false;
          loginBtn.textContent = 'Entrar Agora';
        }
      });
    }

    // Esqueci senha
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', () => {
        this.showRecoveryPopup();
      });
    }

    // Voltar ao login
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        this.hideRecoveryPopup();
        this.showLoginPopup();
      });
    }

    // Fechar recovery
    const closeRecoveryBtn = document.getElementById('closeRecoveryBtn');
    if (closeRecoveryBtn) {
      closeRecoveryBtn.addEventListener('click', () => {
        this.hideRecoveryPopup();
      });
    }

    // Enviar recuperação
    const sendRecoveryBtn = document.getElementById('sendRecoveryBtn');
    if (sendRecoveryBtn) {
      sendRecoveryBtn.addEventListener('click', async () => {
        const email = document.getElementById('recoveryEmail').value;
        const msg = document.getElementById('recoveryMessage');
        const err = document.getElementById('recoveryError');
        
        // Limpar mensagens
        Utils.DOMUtils.removeClass(msg, 'show');
        Utils.DOMUtils.removeClass(err, 'show');
        msg.textContent = err.textContent = '';
        
        // Validar e-mail
        if (!Utils.Validator.required(email)) {
          err.textContent = 'Por favor, digite seu e-mail';
          Utils.DOMUtils.addClass(err, 'show');
          return;
        }
        
        if (!Utils.Validator.email(email)) {
          err.textContent = 'Digite um e-mail válido';
          Utils.DOMUtils.addClass(err, 'show');
          return;
        }
        
        // Desabilitar botão
        sendRecoveryBtn.disabled = true;
        sendRecoveryBtn.textContent = 'Enviando...';
        
        try {
          await this.recoverPassword(email);
          msg.textContent = 'Link enviado! Verifique seu e-mail.';
          Utils.DOMUtils.addClass(msg, 'show');
          
          // Fechar popup após 3 segundos
          setTimeout(() => {
            this.hideRecoveryPopup();
          }, 3000);
        } catch (error) {
          err.textContent = error.message;
          Utils.DOMUtils.addClass(err, 'show');
        } finally {
          sendRecoveryBtn.disabled = false;
          sendRecoveryBtn.textContent = 'Enviar Link de Recuperação';
        }
      });
    }

    // Fechar popups ao clicar fora
    const recoveryPopup = document.getElementById('recoveryPopup');
    if (recoveryPopup) {
      recoveryPopup.addEventListener('click', (e) => {
        if (e.target === recoveryPopup) {
          this.hideRecoveryPopup();
        }
      });
    }

    // Enter nos formulários
    ['email', 'password', 'recoveryEmail'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            if (id === 'email') {
              document.getElementById('password').focus();
            } else if (id === 'password') {
              document.getElementById('loginButton').click();
            } else {
              document.getElementById('sendRecoveryBtn').click();
            }
          }
        });
      }
    });
  }

  // Verificar se está autenticado
  isLoggedIn() {
    return this.isAuthenticated && this.userId !== null;
  }

  // Obter dados do usuário
  getUserData() {
    return {
      id: this.userId,
      email: this.userEmail,
      isAuthenticated: this.isAuthenticated
    };
  }
}

// Exportar AuthManager
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
} else {
  window.AuthManager = AuthManager;
} 