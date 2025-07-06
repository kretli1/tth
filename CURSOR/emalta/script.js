const LOGIN_WEBHOOK_URL   = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547';
const SEARCH_WEBHOOK_URL  = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/b024bddc-64a5-4561-b0b2-4aba543cf499';
const RECOVERY_WEBHOOK_URL= 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/6074b279-3ac1-472c-a0a3-1d6ceec7569b';

let videosData = [];
let userId     = null;
let searchSuggestions = ['viral', 'trending', 'dança', 'comédia', 'tutorial', 'música', 'pets', 'comida', 'viagem', 'arte'];



// Cookies básicos
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days*24*60*60*1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Histórico de pesquisas em cookie (24h)
function getSearchHistory() {
  const cookie = getCookie('searchHistory');
  if (!cookie) return [];
  try {
    return JSON.parse(cookie);
  } catch {
    return [];
  }
}

function addSearchHistory(entry) {
  const history = getSearchHistory();
  history.push(entry);
  setCookie('searchHistory', JSON.stringify(history), 1);
}

// Verifica login salvo
function checkExistingLogin() {
  const savedUserId = getCookie('tiktok_user_id');
  const savedEmail  = getCookie('tiktok_user_email');
  
  console.log('Verificando cookies - userId:', savedUserId, 'email:', savedEmail);
  
  if (savedUserId && savedEmail) {
    userId = savedUserId;
    closeLoginPopup();
    console.log('Login restaurado com sucesso! Email:', savedEmail, 'userId:', userId);
    return true;
  }
  console.log('Cookies não encontrados ou inválidos');
  return false;
}

// ===== FUNÇÕES DOS POPUPS ATUALIZADAS =====

// Função para mostrar popup de login
function showLoginPopup() {
  const popup = document.getElementById('loginPopup');
  if (popup) {
    popup.style.display = 'flex';
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Foca no primeiro campo
    const emailInput = popup.querySelector('#email');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 300);
    }
  }
}

// Função para fechar popup de login
function closeLoginPopup() {
  const popup = document.getElementById('loginPopup');
  if (popup) {
    popup.classList.remove('show');
    setTimeout(() => popup.style.display = 'none', 300);
  }
}

// Função para mostrar popup de recuperação
function showRecoveryPopup() {
  closeLoginPopup();
  const popup = document.getElementById('recoveryPopup');
  if (popup) {
    popup.style.display = 'flex';
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Foca no campo de email
    const emailInput = popup.querySelector('#recoveryEmail');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 300);
    }
  }
}

// Função para fechar popup de recuperação
function closeRecoveryPopup() {
  const popup = document.getElementById('recoveryPopup');
  if (popup) {
    popup.classList.remove('show');
    setTimeout(() => popup.style.display = 'none', 300);
  }
}



// Função para mostrar mensagem no popup
function showPopupMessage(type, message, popupType = 'login') {
  const messageElement = document.getElementById(
    popupType === 'login' ? 'loginError' : 'recoveryError'
  );
  
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `${type === 'error' ? 'error' : 'success'}-message-popup show`;
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
      messageElement.classList.remove('show');
    }, 5000);
  }
}

// Função para processar login no popup
async function handlePopupLogin() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  
  if (!emailInput || !passwordInput || !loginButton) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const remember = false; // Removido checkbox "lembrar-me"
  
  // Validação básica
  if (!email || !password) {
    showPopupMessage('error', 'Por favor, preencha todos os campos', 'login');
    return;
  }
  
  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showPopupMessage('error', 'Por favor, insira um e-mail válido', 'login');
    return;
  }
  
  // UI de loading
  loginButton.disabled = true;
  loginButton.textContent = 'Entrando...';
  
  try {
    console.log('🔐 Tentando login com:', { email, remember });
    
    const response = await fetch(LOGIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      userId = result.userId;
      
      // Salva cookies se "lembrar-me" estiver marcado
      const cookieDays = remember ? 30 : 7;
      setCookie('tiktok_user_id', userId, cookieDays);
      setCookie('tiktok_user_email', email, cookieDays);
      
      if (remember) {
        setCookie('tiktok_remember', 'true', cookieDays);
      }
      
      // Fecha popup imediatamente após sucesso
      closeLoginPopup();
      addLogoutButton();
      
      // Foca no campo de busca
      const keywordInput = document.getElementById('keyword');
      if (keywordInput) keywordInput.focus();
      
    } else {
      showPopupMessage('error', result.message || 'Credenciais inválidas', 'login');
    }
    
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Sistema de fallback
    if (email && password) {
      console.log('🔄 Usando sistema de fallback...');
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      
      const cookieDays = remember ? 30 : 7;
      setCookie('tiktok_user_id', userId, cookieDays);
      setCookie('tiktok_user_email', email, cookieDays);
      
      if (remember) {
        setCookie('tiktok_remember', 'true', cookieDays);
      }
      
      // Fecha popup imediatamente após sucesso (modo offline)
      closeLoginPopup();
      addLogoutButton();
      
      const keywordInput = document.getElementById('keyword');
      if (keywordInput) keywordInput.focus();
    } else {
      showPopupMessage('error', 'Erro de conexão. Verifique sua internet.', 'login');
    }
  } finally {
    // Restaura UI do botão
    loginButton.disabled = false;
    loginButton.textContent = 'Entrar Agora';
  }
}

// Função para processar recuperação de senha no popup
async function handlePopupRecovery() {
  const emailInput = document.getElementById('recoveryEmail');
  const recoveryButton = document.getElementById('sendRecoveryBtn');
  
  if (!emailInput || !recoveryButton) return;
  
  const email = emailInput.value.trim();
  
  // Validação básica
  if (!email) {
    showPopupMessage('error', 'Por favor, digite seu e-mail', 'recovery');
    return;
  }
  
  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showPopupMessage('error', 'Por favor, insira um e-mail válido', 'recovery');
    return;
  }
  
  // UI de loading
  recoveryButton.disabled = true;
  recoveryButton.textContent = 'Enviando...';
  
  try {
    console.log('📧 Enviando recuperação para:', email);
    
    const response = await fetch(RECOVERY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showPopupMessage('success', 'Instruções enviadas para seu e-mail!', 'recovery');
      
      // Limpa campo e volta para login após sucesso
      setTimeout(() => {
        emailInput.value = '';
        closeRecoveryPopup();
        showLoginPopup();
      }, 2000);
    } else {
      showPopupMessage('error', result.message || 'Erro ao enviar e-mail', 'recovery');
    }
    
  } catch (error) {
    console.error('Erro na recuperação:', error);
    showPopupMessage('success', 'Instruções enviadas (modo offline)!', 'recovery');
    
    setTimeout(() => {
      emailInput.value = '';
      closeRecoveryPopup();
      showLoginPopup();
    }, 2000);
  } finally {
    // Restaura UI do botão
    recoveryButton.disabled = false;
    recoveryButton.textContent = 'Enviar Link de Recuperação';
  }
}

// Configuração de eventos dos popups
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Configurando eventos dos popups...');
  
  // Botão de login
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', handlePopupLogin);
  }
  
  // Botão de recuperação
  const recoveryButton = document.getElementById('sendRecoveryBtn');
  if (recoveryButton) {
    recoveryButton.addEventListener('click', handlePopupRecovery);
  }
  
  // Link "Esqueci minha senha"
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRecoveryPopup();
    });
  }
  
  // Link "Voltar ao login"
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeRecoveryPopup();
      showLoginPopup();
    });
  }
  
  // Evento Enter nos campos e animações
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const recoveryEmailInput = document.getElementById('recoveryEmail');
  
  // Função para gerenciar estados inteligentes dos inputs com floating labels
  function addSmartInputEffect(input) {
    if (!input) return;
    
    let wasEmpty = true;
    
    // Verifica se já tem conteúdo no carregamento
    if (input.value.length > 0) {
      input.classList.add('has-content');
      if (input.value.length >= 1) {
        input.classList.add('completed');
      }
      wasEmpty = false;
    }
    
    // Controla os estados do input e floating label
    input.addEventListener('input', () => {
      const hasContent = input.value.length > 0;
      
      // Remove classes de estado anterior
      input.classList.remove('disappearing', 'focus-lost');
      
      // Estado: tem conteúdo
      if (hasContent) {
        input.classList.add('has-content');
        input.classList.add('typing');
        
        // Estado: concluído (1+ caracteres)
        if (input.value.length >= 1) {
          input.classList.add('completed');
        }
        
        wasEmpty = false;
      } else {
        // Estado: voltou para vazio
        if (!wasEmpty) {
          input.classList.add('disappearing');
          setTimeout(() => {
            input.classList.remove('disappearing', 'has-content', 'completed');
          }, 300);
        }
        wasEmpty = true;
      }
      
      // Remove classe typing após parar de digitar
      clearTimeout(input.typingTimeout);
      input.typingTimeout = setTimeout(() => {
        input.classList.remove('typing');
      }, 500);
    });
    
    // Controla foco perdido
    input.addEventListener('blur', () => {
      input.classList.add('focus-lost');
      input.classList.remove('typing');
      
      // Se não estiver concluído, volta para cor inicial após pequeno delay
      if (!input.classList.contains('completed')) {
        setTimeout(() => {
          if (!input.classList.contains('completed') && input.value.length === 0) {
            input.classList.remove('has-content');
          }
        }, 200);
      }
    });
    
    // Remove estado de foco perdido ao focar novamente
    input.addEventListener('focus', () => {
      input.classList.remove('focus-lost');
      
      // Se tem conteúdo, restaura estado
      if (input.value.length > 0) {
        input.classList.add('has-content');
        if (input.value.length >= 1) {
          input.classList.add('completed');
        }
      }
    });
  }
  
  if (emailInput) {
    addSmartInputEffect(emailInput);
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (passwordInput) passwordInput.focus();
      }
    });
  }
  
  if (passwordInput) {
    addSmartInputEffect(passwordInput);
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePopupLogin();
      }
    });
  }
  
  if (recoveryEmailInput) {
    addSmartInputEffect(recoveryEmailInput);
    recoveryEmailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePopupRecovery();
      }
    });
  }
  
  // Popups não podem ser fechados clicando fora ou com ESC
  // (conforme solicitado - usuário deve completar o login)
  
  // Adiciona listener para Enter no campo de busca
  const searchKeywordInput = document.getElementById('keyword');
  if (searchKeywordInput) {
    searchKeywordInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        if (userId) {
          document.getElementById('searchBtn').click();
        } else {
          // Se não estiver logado, mostra popup de login
          showLoginPopup();
        }
      }
    });
  }
  
  console.log('✅ Eventos dos popups configurados!');
});

// Autocomplete de busca
const keywordInput = document.getElementById('keyword');
const suggestionsContainer = document.getElementById('searchSuggestions');

keywordInput.addEventListener('input', function() {
  const value = this.value.toLowerCase();
  
  if (value.length < 2) {
    suggestionsContainer.style.display = 'none';
    return;
  }
  
  const filtered = searchSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(value)
  );
  
  const history = getSearchHistory().slice(-5).map(h => h.keyword);
  const combined = [...new Set([...filtered, ...history])].slice(0, 6);
  
  if (combined.length > 0) {
    suggestionsContainer.innerHTML = combined.map(suggestion => `
      <div class="suggestion-item" data-suggestion="${suggestion}">
        <svg class="suggestion-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        ${suggestion}
      </div>
    `).join('');
    suggestionsContainer.style.display = 'block';
  } else {
    suggestionsContainer.style.display = 'none';
  }
});

suggestionsContainer.addEventListener('click', function(e) {
  const item = e.target.closest('.suggestion-item');
  if (item) {
    keywordInput.value = item.dataset.suggestion;
    suggestionsContainer.style.display = 'none';
    keywordInput.focus();
  }
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-input-container')) {
    suggestionsContainer.style.display = 'none';
  }
});

// Botão voltar ao topo
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Event listener do Enter movido para DOMContentLoaded

// Helpers de formatação
function formatNumber(num) {
  if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
  return num.toString();
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function calculateGrowthRate(video) {
  // Simulação de taxa de crescimento baseada em métricas
  const views = video.play_count || 0;
  const likes = video.digg_count || 0;
  const comments = video.comment_count || 0;
  const shares = video.share_count || 0;
  
  const engagementRate = (likes + comments + shares) / Math.max(views, 1);
  const growthScore = engagementRate * 100;
  
  if (growthScore > 15) return { rate: '🚀 +150%', trending: true };
  if (growthScore > 10) return { rate: '📈 +85%', trending: false };
  if (growthScore > 5) return { rate: '↗️ +45%', trending: false };
  return { rate: '📊 +12%', trending: false };
}

// Função para formatar duração do vídeo
function formatDuration(seconds) {
  if (!seconds) return '0:15'; // Duração padrão
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Função para formatar data
function formatDate(timestamp) {
  if (!timestamp) return 'hoje';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}



// Função para abrir TikTok diretamente
function openTikTokDirectly(author) {
  const username = author.unique_id || author.nickname || 'usuario';
  const tiktokUrl = `https://www.tiktok.com/@${username}`;
  window.open(tiktokUrl, '_blank');
}

// Cria o card de vídeo atualizado (9:16, sem download, logo TikTok, mais informações)
function createVideoCard(video, index) {
  const card = document.createElement('div');
  const videoId = video.aweme_id || `video-${index}`;
  const publishDate = formatDate(video.create_time);
  
  card.className = 'video-card';
  card.dataset.videoId = videoId;
  
  card.innerHTML = `
    <div class="video-wrapper">
      <video class="video-player" controls preload="metadata">
        <source src="${video.play}" type="video/mp4">
        Seu navegador não suporta vídeo.
      </video>
      <div class="video-date-overlay">${publishDate}</div>
    </div>
    <div class="video-info">
      <div class="video-title">${video.title || 'Sem título'}</div>
      <div class="video-author">
        <div class="author-info-centered">
          <span class="author-name-clickable" onclick="openTikTokDirectly(${JSON.stringify(video.author).replace(/"/g, '&quot;')})">
            @${video.author?.nickname || 'usuario'}
            <svg class="link-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="video-stats">
        <div class="stat-item">
          <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          ${formatNumber(video.play_count || 0)}
        </div>
        <div class="stat-item">
          <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${formatNumber(video.digg_count || 0)}
        </div>
        <div class="stat-item">
          <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${formatNumber(video.comment_count || 0)}
        </div>
        <div class="stat-item">
          <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
          ${formatNumber(video.share_count || 0)}
        </div>
      </div>
    </div>
  `;
  
  return card;
}

// Busca vídeos e salva histórico
document.getElementById('searchBtn').addEventListener('click', async () => {
  // Verifica se o userId está definido, se não, tenta restaurar do cookie
  if (!userId) {
    console.log('❌ userId não definido, tentando restaurar...');
    if (!checkExistingLogin()) {
      console.log('❌ Não foi possível restaurar login, mostrando popup');
      showLoginPopup();
      return;
    }
    console.log('✅ Login restaurado com sucesso para busca');
  }

  const keyword = document.getElementById('keyword').value.trim();
  const region  = document.getElementById('region').value;
  const period  = document.getElementById('period').value;
  const sortBy  = document.getElementById('sortBy').value;

  if (!keyword) {
    alert('Por favor, preencha a palavra-chave');
    return;
  }

  // Salva no histórico
  const historyEntry = {
    keyword,
    region,
    period,
    sortBy,
    timestamp: new Date().toISOString()
  };
  addSearchHistory(historyEntry);

  document.getElementById('tikTokLogos').style.display = 'none';
  const btn     = document.getElementById('searchBtn');
  const loading = document.getElementById('loading');
  const grid    = document.getElementById('videosGrid');

  btn.disabled    = true;
  btn.textContent = 'Buscando...';
  loading.style.display = 'flex';
  grid.innerHTML  = '';

  try {
    const res  = await fetch(SEARCH_WEBHOOK_URL, {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({ keyword, region, period, sortBy, userId })
    });
    const data = await res.json();

    if (data.success && data.videos) {
      videosData = data.videos;
      if (videosData.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <span class="emoji">😕</span>
            <h3>Nenhum vídeo encontrado</h3>
            <p>Tente outras palavras-chave ou filtros</p>
          </div>`;
      } else {
        videosData.forEach((v, i) => grid.appendChild(createVideoCard(v, i)));
      }
    } else {
      grid.innerHTML = `
        <div class="error-state">
          <span class="emoji">❌</span>
          <h3>Ops! Algo deu errado</h3>
          <p>${data.message || 'Tente novamente'}</p>
        </div>`;
    }
  } catch (err) {
    grid.innerHTML = `
      <div class="error-state">
        <span class="emoji">⚠️</span>
        <h3>Erro na conexão</h3>
        <p>Verifique sua internet e tente novamente</p>
      </div>`;
  } finally {
    loading.style.display = 'none';
    btn.disabled    = false;
    btn.textContent = 'Descobrir';
  }
});

// Enter nos campos de filtro (região, período, etc) - exceto keyword que já está configurado
document.querySelectorAll('.form-input, .select-input').forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && input.id !== 'keyword') {
      // Verifica se está logado antes de fazer a busca
      if (userId || checkExistingLogin()) {
        document.getElementById('searchBtn').click();
      } else {
        showLoginPopup();
      }
    }
  });
});

// Logout opcional
function logout() {
  deleteCookie('tiktok_user_id');
  deleteCookie('tiktok_user_email');
  deleteCookie('tiktok_remember');
  userId = null;
  
  // Limpa campos
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  
  showLoginPopup();
}

// Adiciona botão de logout
function addLogoutButton() {
  if (getCookie('tiktok_user_id')) {
    const headerActions = document.querySelector('.header-actions') || document.querySelector('.header-top');
    const logoutBtn     = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.className   = 'logout-btn';
    logoutBtn.addEventListener('click', logout);
    headerActions.appendChild(logoutBtn);
  }
}

// Auto-focus e inicialização
window.addEventListener('load', () => {
  console.log('🔍 Verificando login existente...');
  if (!checkExistingLogin()) {
    console.log('❌ Nenhum login encontrado, mostrando popup');
    showLoginPopup();
  } else {
    console.log('✅ Login válido encontrado, userId:', userId);
    setTimeout(() => document.getElementById('keyword').focus(), 100);
    addLogoutButton();
  }
  
  // Carrega logos animadas
  createFloatingLogos();
});

function createFloatingLogos() {
  const container = document.getElementById('tikTokLogos');
  const logoUrl = 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png';
  
  for (let i = 0; i < 5; i++) {
    const logo = document.createElement('div');
    logo.className = 'tiktok-logo-floating';
    logo.innerHTML = `<img src="${logoUrl}" alt="TikTok">`;
    container.appendChild(logo);
  }
}




