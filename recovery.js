// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Recovery page loaded');
  
  // Verifica se já está logado
  checkAuthStatus();
  
  // Inicializa logos flutuantes
  initBackgroundLogos();
  
  // Configura o formulário de recuperação
  setupRecoveryForm();
});

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function checkAuthStatus() {
  console.log('Checking auth status on recovery page...');
  
  // Verifica cookie
  const userIdFromCookie = getCookie('tiktok_user_id');
  
  if (userIdFromCookie && userIdFromCookie !== 'null' && userIdFromCookie !== '') {
    console.log('User already logged in, redirecting to dashboard...');
    // Redireciona para o dashboard
    window.location.href = 'index.html';
    return;
  }
  
  console.log('User not logged in, showing recovery form');
}

// ===== CONFIGURAÇÃO DO FORMULÁRIO =====
function setupRecoveryForm() {
  const recoveryForm = document.getElementById('recoveryForm');
  const recoveryButton = document.getElementById('sendRecoveryBtn');
  const emailInput = document.getElementById('recoveryEmail');
  
  if (!recoveryForm) {
    console.error('Recovery form not found');
    return;
  }
  
  // Event listener para o formulário
  recoveryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleRecovery();
  });
  
  // Event listener para Enter no campo de e-mail
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRecovery();
      }
    });
  }
}

// ===== FUNÇÃO DE RECUPERAÇÃO =====
async function handleRecovery() {
  console.log('Starting recovery process...');
  
  const emailInput = document.getElementById('recoveryEmail');
  const recoveryButton = document.getElementById('sendRecoveryBtn');
  const messageDiv = document.getElementById('recoveryMessage');
  const errorDiv = document.getElementById('recoveryError');
  const btnText = recoveryButton.querySelector('.btn-text');
  const btnLoading = recoveryButton.querySelector('.btn-loading');
  
  const email = emailInput.value.trim();
  
  // Validação básica
  if (!email) {
    showError('Por favor, digite seu e-mail');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Por favor, digite um e-mail válido');
    return;
  }
  
  // UI de loading
  recoveryButton.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'flex';
  hideMessages();
  
  try {
    console.log('Making recovery request...');
    
    const response = await fetch('https://hook.us2.make.com/qcnm6bsggmddwbj7z4zxz2k5wxjnyzd2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        action: 'recovery'
      }),
    });
    
    console.log('Recovery response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Recovery response data:', data);
    
    if (data.success || data.status === 'success') {
      // Recuperação bem-sucedida
      console.log('Recovery email sent successfully');
      
      showSuccess('🎉 Link de recuperação enviado com sucesso! Verifique sua caixa de entrada e também a pasta de spam. O link expira em 1 hora.');
      
      // Limpa o campo de e-mail
      emailInput.value = '';
      
      // Opcional: redirecionar para login após alguns segundos
      setTimeout(() => {
        showSuccess('🎉 E-mail enviado! Redirecionando para o login...');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }, 8000);
      
    } else {
      // Recuperação falhou
      console.log('Recovery failed:', data.message || 'Falha na recuperação');
      throw new Error(data.message || 'E-mail não encontrado ou erro no envio');
    }
    
  } catch (error) {
    console.error('Recovery error:', error);
    
    let errorMessage = 'Erro ao enviar link de recuperação. Tente novamente.';
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      errorMessage = 'E-mail não encontrado em nossa base de dados.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
    } else if (error.message.includes('timeout') || error.message.includes('network')) {
      errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    
    showError(errorMessage);
  } finally {
    // Restaura UI
    recoveryButton.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// ===== FUNÇÕES DE MENSAGEM =====
function showError(message) {
  hideMessages();
  const errorDiv = document.getElementById('recoveryError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.className = 'error-message show';
  }
}

function showSuccess(message) {
  hideMessages();
  const messageDiv = document.getElementById('recoveryMessage');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = 'success-message show';
  }
}

function hideMessages() {
  const errorDiv = document.getElementById('recoveryError');
  const messageDiv = document.getElementById('recoveryMessage');
  
  if (errorDiv) {
    errorDiv.className = 'error-message';
  }
  
  if (messageDiv) {
    messageDiv.className = 'success-message';
  }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== FUNÇÕES DE COOKIE =====
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
  
  console.log('Initializing background logos for recovery page');
  
  const logos = [
    'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png'
  ];
  
  // Cria logos flutuantes
  for (let i = 0; i < 6; i++) {
    const logo = document.createElement('div');
    logo.className = 'floating-logo';
    logo.style.cssText = `
      position: absolute;
      width: ${25 + Math.random() * 35}px;
      height: ${25 + Math.random() * 35}px;
      background-image: url(${logos[Math.floor(Math.random() * logos.length)]});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: ${0.1 + Math.random() * 0.15};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${12 + Math.random() * 18}s infinite linear;
      pointer-events: none;
      z-index: 1;
    `;
    
    container.appendChild(logo);
  }
  
  // Adiciona CSS da animação se não existir
  if (!document.querySelector('#float-animation-recovery')) {
    const style = document.createElement('style');
    style.id = 'float-animation-recovery';
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(100vh) rotate(0deg); }
        100% { transform: translateY(-100vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== MELHORIAS UX =====
// Animação suave para transição de estados
document.addEventListener('DOMContentLoaded', function() {
  // Adiciona classe para animações suaves
  document.body.classList.add('recovery-loaded');
  
  // Foco automático no campo de e-mail
  setTimeout(() => {
    const emailInput = document.getElementById('recoveryEmail');
    if (emailInput) {
      emailInput.focus();
    }
  }, 500);
}); 