// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Login page loaded');
  
  // Verifica se já está logado
  checkAuthStatus();
  
  // Inicializa logos flutuantes
  initBackgroundLogos();
  
  // Configura o formulário de login
  setupLoginForm();
});

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function checkAuthStatus() {
  console.log('Checking auth status on login page...');
  
  // Verifica cookie
  const userIdFromCookie = getCookie('tiktok_user_id');
  
  if (userIdFromCookie && userIdFromCookie !== 'null' && userIdFromCookie !== '') {
    console.log('User already logged in, redirecting to dashboard...');
    // Redireciona para o dashboard
    window.location.href = 'index.html';
    return;
  }
  
  console.log('User not logged in, showing login form');
}

// ===== CONFIGURAÇÃO DO FORMULÁRIO =====
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  if (!loginForm) {
    console.error('Login form not found');
    return;
  }
  
  // Event listener para o formulário
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin();
  });
  
  // Event listeners para os inputs
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }
}

// ===== FUNÇÃO DE LOGIN =====
async function handleLogin() {
  console.log('Starting login process...');
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  const errorDiv = document.getElementById('loginError');
  const btnText = loginButton.querySelector('.btn-text');
  const btnLoading = loginButton.querySelector('.btn-loading');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  // Validação básica
  if (!email || !password) {
    showError('Por favor, preencha todos os campos');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Por favor, digite um e-mail válido');
    return;
  }
  
  // UI de loading
  loginButton.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'flex';
  hideError();
  
  try {
    console.log('Making login request...');
    
    const response = await fetch('https://hook.us2.make.com/fu69t2v5bmdz19scp6yfjk5whd5uaiv7', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        action: 'login'
      }),
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Login response data:', data);
    
    if (data.success || data.status === 'success') {
      // Login bem-sucedido
      console.log('Login successful');
      
      const userId = data.user_id || data.userId || email;
      
      // Salva o userId em cookie e variável global
      setCookie('tiktok_user_id', userId, 7);
      window.userId = userId;
      
      console.log('User ID saved:', userId);
      
      // Sucesso visual
      showSuccess('Login realizado com sucesso! Redirecionando...');
      
      // Redireciona após 1.5 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } else {
      // Login falhou
      console.log('Login failed:', data.message || 'Login inválido');
      throw new Error(data.message || 'E-mail ou senha incorretos');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Erro ao fazer login. Tente novamente.');
  } finally {
    // Restaura UI
    loginButton.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// ===== FUNÇÕES DE MENSAGEM =====
function showError(message) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.className = 'error-message show';
  }
}

function showSuccess(message) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.className = 'success-message show';
  }
}

function hideError() {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.className = 'error-message';
  }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== FUNÇÕES DE COOKIE =====
function setCookie(name, value, days) {
  try {
    const encodedValue = encodeURIComponent(value);
    let expires = '';
    
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    
    const cookieString = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log(`Cookie set: ${name}=${encodedValue}`);
    
    // Verifica se foi salvo
    setTimeout(() => {
      const savedValue = getCookie(name);
      console.log(`Cookie verification - saved: ${savedValue}`);
    }, 100);
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

function getCookie(name) {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

// ===== LOGOS FLUTUANTES =====
function initBackgroundLogos() {
  const container = document.getElementById('backgroundLogos');
  if (!container) return;
  
  console.log('Initializing background logos for login page');
  
  const logos = [
    'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png'
  ];
  
  // Cria logos flutuantes
  for (let i = 0; i < 8; i++) {
    const logo = document.createElement('div');
    logo.className = 'floating-logo';
    logo.style.cssText = `
      position: absolute;
      width: ${20 + Math.random() * 40}px;
      height: ${20 + Math.random() * 40}px;
      background-image: url(${logos[Math.floor(Math.random() * logos.length)]});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: ${0.1 + Math.random() * 0.2};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${10 + Math.random() * 20}s infinite linear;
      pointer-events: none;
      z-index: 1;
    `;
    
    container.appendChild(logo);
  }
  
  // Adiciona CSS da animação se não existir
  if (!document.querySelector('#float-animation')) {
    const style = document.createElement('style');
    style.id = 'float-animation';
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(100vh) rotate(0deg); }
        100% { transform: translateY(-100vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
} 