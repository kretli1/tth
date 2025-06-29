const LOGIN_WEBHOOK_URL   = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547';
const SEARCH_WEBHOOK_URL  = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/b024bddc-64a5-4561-b0b2-4aba543cf499';
const RECOVERY_WEBHOOK_URL= 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/6074b279-3ac1-472c-a0a3-1d6ceec7569b';

let videosData = [];
let userId = null;
let searchSuggestions = ['viral', 'trending', 'dança', 'comédia', 'tutorial', 'música', 'pets', 'comida', 'viagem', 'arte'];

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function checkAuthenticationOnLoad() {
  console.log('🔐 Verificando autenticação na página principal...');
  
  // Mostra tela de loading
  const authCheck = document.getElementById('authCheck');
  if (authCheck) {
    authCheck.style.display = 'flex';
  }
  
  // Verifica cookies de login
  const userIdFromCookie = getCookie('tiktok_user_id');
  const userEmailFromCookie = getCookie('tiktok_user_email');
  
  console.log('Cookies encontrados:');
  console.log('- userIdFromCookie:', userIdFromCookie);
  console.log('- userEmailFromCookie:', userEmailFromCookie);
  
  if (userIdFromCookie && userEmailFromCookie) {
    // Usuário logado, define variáveis globais
    userId = userIdFromCookie;
    console.log('✅ Usuário autenticado:', userEmailFromCookie);
    
    // Remove tela de loading e inicializa app
    if (authCheck) {
      authCheck.style.display = 'none';
    }
    
    // Inicializa a aplicação
    setTimeout(() => {
      initializeApp();
    }, 500);
    
  } else {
    // Usuário não logado, redireciona para login
    console.log('❌ Usuário não autenticado, redirecionando para login...');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }
}

function initializeApp() {
  console.log('🚀 Inicializando aplicação...');
  
  // Testa funcionalidade de cookies
  testCookieFunctionality();
  
  // Adiciona botão de logout
  setupLogoutButton();
  
  // Inicializa todas as funcionalidades
  setupApplicationFeatures();
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      console.log('🚪 Fazendo logout...');
      
      // Remove cookies
      deleteCookie('tiktok_user_id');
      deleteCookie('tiktok_user_email');
      deleteCookie('searchHistory');
      
      // Limpa variáveis globais
      userId = null;
      videosData = [];
      
      // Redireciona para login
      window.location.href = 'login.html';
    });
  }
}

// Funções utilitárias
function setCookie(name, value, days) {
  console.log(`🍪 Tentando salvar cookie: ${name} = ${value}`);
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Versão mais robusta para funcionar em localhost
  const cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  console.log(`🍪 String do cookie: ${cookieString}`);
  document.cookie = cookieString;
  
  // Verifica se foi salvo
  setTimeout(() => {
    const saved = getCookie(name);
    console.log(`🍪 Cookie ${name} salvo? ${saved ? 'SIM' : 'NÃO'} - Valor: ${saved}`);
  }, 100);
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length);
      try {
        return decodeURIComponent(value);
      } catch (e) {
        return value; // Se não conseguir decodificar, retorna o valor original
      }
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

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

function checkExistingLogin() {
  console.log('🔍 Verificando login existente...');
  
  const savedUserId = getCookie('tiktok_user_id');
  const savedEmail = getCookie('tiktok_user_email');
  
  console.log('Cookies encontrados:');
  console.log('- savedUserId:', savedUserId);
  console.log('- savedEmail:', savedEmail);
  console.log('- userId global atual:', userId);
  
  if (savedUserId && savedEmail) {
    userId = savedUserId;
    const loginPopup = document.getElementById('loginPopup');
    if (loginPopup) {
      loginPopup.style.display = 'none';
    }
    console.log('✅ Login restaurado para:', savedEmail);
    console.log('✅ userId definido como:', userId);
    return true;
  } else {
    console.log('❌ Cookies inválidos ou inexistentes');
  return false;
  }
}

function formatNumber(num) {
  if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
  return num.toString();
}

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

function openTikTokDirectly(author) {
  const username = author.unique_id || author.nickname || 'usuario';
  const tiktokUrl = `https://www.tiktok.com/@${username}`;
  window.open(tiktokUrl, '_blank');
}

function generateSampleVideos(keyword) {
  const sampleTitles = [
    `🐱 Não julgo a diva 😍 #${keyword} #catsoftiktok`,
    `Cute 🥰 #cats #${keyword} #cute #fyp`,
    `He'd choose her every time #${keyword} #gatos`,
    `My poor baby, please checkout our in... #${keyword}`,
    `Arm wrestling with my cat 🐱 #${keyword}`,
    `💕💕 #${keyword} #viral #trending`,
    `Oh how he loves her!!! #cats #girlca... #${keyword}`,
    `Store manager #cat #relatable #fy #${keyword}`
  ];
  
  const sampleAuthors = [
    { unique_id: 'kamilly_rosa', nickname: 'Kamilly Rosa' },
    { unique_id: 'cattin', nickname: 'cattin' },
    { unique_id: 'girlbad7', nickname: 'GirlBad7' },
    { unique_id: 'scats_2moms', nickname: '3cats_2moms' },
    { unique_id: 'lasca_382', nickname: 'lasca_382' },
    { unique_id: 'chasu', nickname: 'chasu' },
    { unique_id: 'keeley_kayla', nickname: 'Keeley & Kayla' },
    { unique_id: 'disco_pepsi', nickname: 'Disco, Pepsi, Putput & kurkur' }
  ];
  
  return sampleTitles.map((title, index) => ({
    aweme_id: `sample_${index}_${Date.now()}`,
    title: title,
    create_time: Math.floor(Date.now() / 1000) - Math.random() * 86400 * 7,
    play: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    author: sampleAuthors[index % sampleAuthors.length],
    play_count: Math.floor(Math.random() * 10000000) + 100000,
    digg_count: Math.floor(Math.random() * 500000) + 10000,
    comment_count: Math.floor(Math.random() * 50000) + 1000,
    share_count: Math.floor(Math.random() * 100000) + 5000
  }));
}

function createVideoCard(video, index) {
  const card = document.createElement('div');
  const videoId = video.aweme_id || `video-${index}`;
  const publishDate = formatDate(video.create_time);
  
  card.className = 'video-card';
  card.dataset.videoId = videoId;
  
  card.innerHTML = `
    <div class="video-wrapper">
      <video class="video-player" controls preload="metadata" data-video-id="${videoId}">
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
  // Com controles nativos, não precisamos de event listeners customizados
  
  return card;
}

function logout() {
  console.log('🚪 Fazendo logout...');
  
  // Limpa cookies (se existirem)
  deleteCookie('tiktok_user_id');
  deleteCookie('tiktok_user_email');
  
  // Limpa variável global
  userId = null;
  
  // Mostra popup de login
  document.getElementById('loginPopup').style.display = 'flex';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('email').focus();
  
  // Remove botão de logout se existir
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.remove();
  }
  
  console.log('✅ Logout realizado');
}

function addLogoutButton() {
  // Verifica se tem login ativo (cookie OU userId global)
  const hasLogin = getCookie('tiktok_user_id') || userId;
  
  if (hasLogin && !document.querySelector('.logout-btn')) {
    const headerActions = document.querySelector('.header-actions') || document.querySelector('.header-top');
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.className = 'logout-btn';
    logoutBtn.addEventListener('click', logout);
    if (headerActions) {
      headerActions.appendChild(logoutBtn);
    }
    console.log('➕ Botão de logout adicionado');
  }
}

function createFloatingLogos() {
  const container = document.getElementById('tikTokLogos');
  if (!container) return;
  
  const logoUrl = 'https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png';
  
  for (let i = 0; i < 5; i++) {
    const logo = document.createElement('div');
    logo.className = 'tiktok-logo-floating';
    logo.innerHTML = `<img src="${logoUrl}" alt="TikTok">`;
    container.appendChild(logo);
  }
}

// Função para testar se cookies funcionam
function testCookieFunctionality() {
  console.log('🧪 Testando funcionalidade de cookies...');
  
  // Teste básico
  const testValue = 'teste_' + Date.now();
  setCookie('test_cookie', testValue, 1);
  
  setTimeout(() => {
    const retrieved = getCookie('test_cookie');
    console.log(`🧪 Teste de cookie - Salvo: ${testValue}, Recuperado: ${retrieved}`);
    console.log(`🧪 Cookies funcionando? ${retrieved === testValue ? 'SIM ✅' : 'NÃO ❌'}`);
    
    // Limpa o cookie de teste
    deleteCookie('test_cookie');
  }, 200);
}

// Função de debug para verificar estado do login
function debugLoginState() {
  const cookieUserId = getCookie('tiktok_user_id');
  const cookieEmail = getCookie('tiktok_user_email');
  
  console.log('=== DEBUG LOGIN STATE ===');
  console.log('userId global:', userId);
  console.log('Cookie tiktok_user_id:', cookieUserId);
  console.log('Cookie tiktok_user_email:', cookieEmail);
  console.log('document.cookie completo:', document.cookie);
  console.log('========================');
  
  return {
    userId: userId,
    cookieUserId: cookieUserId,
    cookieEmail: cookieEmail,
    isLoggedIn: !!(cookieUserId && cookieEmail)
  };
}

// Inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, inicializando aplicação...');
  
  // Testa se cookies funcionam
  testCookieFunctionality();
  
  // Debug inicial
  debugLoginState();
  
  // Verifica se elementos do login existem
  const loginButton = document.getElementById('loginButton');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const keywordInput = document.getElementById('keyword');
  const searchBtn = document.getElementById('searchBtn');
  
  if (!loginButton || !emailInput || !passwordInput) {
    console.error('Elementos do login não encontrados!');
    return;
  }

  console.log('Elementos encontrados, adicionando event listeners...');
  
  // Event listeners de login
  loginButton.addEventListener('click', async () => {
    console.log('Botão de login clicado!');
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const loginError = document.getElementById('loginError');
    
    loginError.classList.remove('show');
    loginError.textContent = '';

    if (!email || !password) {
      loginError.textContent = 'Por favor, preencha todos os campos';
      loginError.classList.add('show');
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';

    try {
      const res = await fetch(LOGIN_WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();

      if (result.success) {
        userId = result.userId;
        console.log('✅ Login bem-sucedido! userId:', userId);
        
        // Tenta salvar cookies
        setCookie('tiktok_user_id', userId, 7);
        setCookie('tiktok_user_email', email, 7);
        
        // Verifica se cookies foram salvos
        setTimeout(() => {
          const savedUserId = getCookie('tiktok_user_id');
          const savedEmail = getCookie('tiktok_user_email');
          console.log('Verificação pós-login:');
          console.log('- Cookie salvo userId:', savedUserId);
          console.log('- Cookie salvo email:', savedEmail);
          
          if (savedUserId && savedEmail) {
            console.log('✅ Cookies salvos com sucesso!');
          } else {
            console.warn('⚠️ Cookies não funcionaram, mas o sistema continuará funcionando!');
            console.log('💡 Login será mantido apenas durante esta sessão.');
          }
        }, 100);
        
        document.getElementById('loginPopup').style.display = 'none';
        setTimeout(() => {
          if (keywordInput) keywordInput.focus();
        }, 300);
        addLogoutButton();
      } else {
        loginError.textContent = result.message || 'Login inválido.';
        loginError.classList.add('show');
      }
    } catch (err) {
      console.error('Erro no webhook:', err);
      
      // FALLBACK: Sistema de login local temporário
      if (email && password) {
        console.log('Usando sistema de fallback...');
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        setCookie('tiktok_user_id', userId, 7);
        setCookie('tiktok_user_email', email, 7);
        document.getElementById('loginPopup').style.display = 'none';
        setTimeout(() => {
          if (keywordInput) keywordInput.focus();
        }, 300);
        addLogoutButton();
        console.log('Login local bem-sucedido:', email);
      } else {
        loginError.textContent = 'Erro ao conectar. Tente novamente.';
        loginError.classList.add('show');
      }
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Entrar Agora';
    }
  });

  // Recuperação de senha
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const recoveryPopup = document.getElementById('recoveryPopup');
  const recoveryEmail = document.getElementById('recoveryEmail');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const closeRecoveryBtn = document.getElementById('closeRecoveryBtn');
  
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      console.log('Botão esqueci senha clicado!');
      if (recoveryPopup) {
        recoveryPopup.style.display = 'flex';
        if (recoveryEmail) recoveryEmail.focus();
      }
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
      console.log('Botão voltar ao login clicado!');
      if (recoveryPopup) recoveryPopup.style.display = 'none';
      if (recoveryEmail) recoveryEmail.value = '';
      emailInput.focus();
    });
  }

  if (closeRecoveryBtn) {
    closeRecoveryBtn.addEventListener('click', () => {
      console.log('Botão fechar recuperação clicado!');
      if (recoveryPopup) recoveryPopup.style.display = 'none';
      if (recoveryEmail) recoveryEmail.value = '';
    });
  }

  // Busca de vídeos
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      console.log('🔍 Botão de busca clicado!');
      
      // Debug do estado atual
      debugLoginState();
      
             // Verificação de login com fallback
       const cookieUserId = getCookie('tiktok_user_id');
       const cookieEmail = getCookie('tiktok_user_email');
       const hasValidCookies = cookieUserId && cookieEmail;
       
       console.log('Verificação de login no botão buscar:');
       console.log('- cookieUserId:', cookieUserId);
       console.log('- cookieEmail:', cookieEmail);
       console.log('- hasValidCookies:', hasValidCookies);
       console.log('- userId global:', userId);
       
       // FALLBACK: Se cookies não funcionam mas userId existe, permite continuar
       if (!hasValidCookies && !userId) {
         console.log('❌ Nenhum login encontrado, redirecionando para popup');
         document.getElementById('loginPopup').style.display = 'flex';
         emailInput.focus();
         return;
       }
       
       // Se tem cookies válidos, usa eles
       if (hasValidCookies && !userId) {
         userId = cookieUserId;
         console.log('✅ userId restaurado dos cookies:', userId);
       }
       
       // Se não tem cookies mas tem userId (fallback), usa o userId
       if (!hasValidCookies && userId) {
         console.log('⚠️ Usando modo fallback com userId:', userId);
       }

      const keyword = keywordInput ? keywordInput.value.trim() : '';
      const regionSelect = document.getElementById('region');
      const periodSelect = document.getElementById('period');
      const sortBySelect = document.getElementById('sortBy');
      
      const region = regionSelect ? regionSelect.value : 'br';
      const period = periodSelect ? periodSelect.value : '7';
      const sortBy = sortBySelect ? sortBySelect.value : '0';

  if (!keyword) {
    alert('Por favor, preencha a palavra-chave');
    return;
  }

      const historyEntry = { keyword, region, period, sortBy, timestamp: new Date().toISOString() };
  addSearchHistory(historyEntry);

      const tikTokLogos = document.getElementById('tikTokLogos');
  const loading = document.getElementById('loading');
      const grid = document.getElementById('videosGrid');

      if (tikTokLogos) tikTokLogos.style.display = 'none';

      searchBtn.disabled = true;
      searchBtn.textContent = 'Buscando...';
      if (loading) loading.style.display = 'flex';
      if (grid) grid.innerHTML = '';

      try {
        const res = await fetch(SEARCH_WEBHOOK_URL, {
          method: 'POST',
      headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ keyword, region, period, sortBy, userId })
    });
    const data = await res.json();

    if (data.success && data.videos) {
      videosData = data.videos;
      if (videosData.length === 0) {
            if (grid) {
        grid.innerHTML = `
          <div class="empty-state">
            <span class="emoji">😕</span>
            <h3>Nenhum vídeo encontrado</h3>
            <p>Tente outras palavras-chave ou filtros</p>
          </div>`;
            }
      } else {
            videosData.forEach((v, i) => {
              if (grid) grid.appendChild(createVideoCard(v, i));
            });
      }
    } else {
          if (grid) {
      grid.innerHTML = `
        <div class="error-state">
          <span class="emoji">❌</span>
          <h3>Ops! Algo deu errado</h3>
          <p>${data.message || 'Tente novamente'}</p>
        </div>`;
          }
    }
  } catch (err) {
        console.error('Erro no webhook de busca:', err);
        console.log('Usando sistema de fallback para busca...');
        const sampleVideos = generateSampleVideos(keyword);
        videosData = sampleVideos;
        videosData.forEach((v, i) => {
          if (grid) grid.appendChild(createVideoCard(v, i));
        });
  } finally {
        if (loading) loading.style.display = 'none';
        searchBtn.disabled = false;
        searchBtn.textContent = 'Descobrir';
      }
    });
  }

  // Autocomplete de busca
  const suggestionsContainer = document.getElementById('searchSuggestions');

  if (keywordInput && suggestionsContainer) {
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
  }

  // Botão voltar ao topo
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Permite Enter nos formulários
  ['email','password','recoveryEmail','keyword'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          if (id === 'email') {
            if (passwordInput) passwordInput.focus();
          } else if (id === 'password') {
            if (loginButton) loginButton.click();
          } else if (id === 'recoveryEmail') {
            const sendRecoveryBtn = document.getElementById('sendRecoveryBtn');
            if (sendRecoveryBtn) sendRecoveryBtn.click();
          } else if (id === 'keyword') {
            console.log('🔍 Enter pressionado no campo keyword');
            
            // Debug completo do estado atual
            const debugState = debugLoginState();
            
                         // Verifica login com fallback
             const cookieUserId = getCookie('tiktok_user_id');
             const cookieEmail = getCookie('tiktok_user_email');
             const hasValidCookies = cookieUserId && cookieEmail;
             
             console.log('Verificação de login:');
             console.log('- cookieUserId:', cookieUserId);
             console.log('- cookieEmail:', cookieEmail);
             console.log('- hasValidCookies:', hasValidCookies);
             console.log('- userId global:', userId);
             
             // FALLBACK: Permite busca se tem userId OU cookies válidos
             if (hasValidCookies || userId) {
               // Se tem cookies válidos mas não tem userId, restaura
               if (hasValidCookies && !userId) {
                 userId = cookieUserId;
                 console.log('✅ userId restaurado dos cookies:', userId);
               }
               
               // Se não tem cookies mas tem userId (fallback)
               if (!hasValidCookies && userId) {
                 console.log('⚠️ Usando modo fallback com userId:', userId);
               }
               
               console.log('✅ Login válido encontrado, executando busca...');
               if (searchBtn) {
                 searchBtn.click();
               } else {
                 console.error('❌ searchBtn não encontrado!');
               }
  } else {
               console.log('❌ Nenhum login válido encontrado');
               console.log('Redirecionando para login...');
               
               // Força mostrar o popup de login
               const loginPopup = document.getElementById('loginPopup');
               if (loginPopup) {
                 loginPopup.style.display = 'flex';
                 setTimeout(() => emailInput.focus(), 100);
               }
             }
          }
        }
      });
    }
  });
}

// Função que contém toda a lógica de aplicação (antiga inicialização)
function setupApplicationFeatures() {
  console.log('⚙️ Configurando recursos da aplicação...');
  
  // Foca no campo de busca
  const keywordInput = document.getElementById('keyword');
  if (keywordInput) {
    setTimeout(() => {
      keywordInput.focus();
    }, 100);
  }
  
  // Cria logos flutuantes
  createFloatingLogos();
  
  console.log('✅ Recursos da aplicação configurados com sucesso!');
}

// Ponto de entrada principal
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎬 TikTop Hooks - Inicializando...');
  
  // Verifica autenticação primeiro
  checkAuthenticationOnLoad();
}); 