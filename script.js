const LOGIN_WEBHOOK_URL   = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547';
const SEARCH_WEBHOOK_URL  = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/b024bddc-64a5-4561-b0b2-4aba543cf499';
const RECOVERY_WEBHOOK_URL= 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/password-recovery';

let videosData = [];
let userId     = null;

// Cookies
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
  if (savedUserId && savedEmail) {
    userId = savedUserId;
    document.getElementById('loginPopup').style.display = 'none';
    console.log('Login restaurado:', savedEmail);
    return true;
  }
  return false;
}

// Eventos de login
document.getElementById('loginButton').addEventListener('click', async () => {
  const loginBtn   = document.getElementById('loginButton');
  const email      = document.getElementById('email').value;
  const password   = document.getElementById('password').value;
  const loginError = document.getElementById('loginError');
  loginError.classList.remove('show');
  loginError.textContent = '';

  if (!email || !password) {
    loginError.textContent = 'Por favor, preencha todos os campos';
    return loginError.classList.add('show');
  }

  loginBtn.disabled    = true;
  loginBtn.textContent = 'Entrando...';

  try {
    const res    = await fetch(LOGIN_WEBHOOK_URL, {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({ email, password })
    });
    const result = await res.json();

    if (result.success) {
      userId = result.userId;
      setCookie('tiktok_user_id', userId, 7);
      setCookie('tiktok_user_email', email, 7);
      document.getElementById('loginPopup').style.display = 'none';
      setTimeout(() => document.getElementById('keyword').focus(), 300);
    } else {
      loginError.textContent = result.message || 'Login inválido.';
      loginError.classList.add('show');
    }
  } catch (err) {
    loginError.textContent = 'Erro ao conectar. Verifique sua internet.';
    loginError.classList.add('show');
  } finally {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Entrar Agora';
  }
});

// Esqueci senha
document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'flex';
  document.getElementById('recoveryEmail').focus();
});

// Voltar ao login / fechar recovery
document.getElementById('backToLoginBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'none';
  clearRecoveryForm();
  document.getElementById('email').focus();
});
document.getElementById('closeRecoveryBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'none';
  clearRecoveryForm();
});

// Envia link de recuperação
document.getElementById('sendRecoveryBtn').addEventListener('click', async () => {
  const btn = document.getElementById('sendRecoveryBtn');
  const email = document.getElementById('recoveryEmail').value;
  const msg = document.getElementById('recoveryMessage');
  const err = document.getElementById('recoveryError');
  msg.classList.remove('show');
  err.classList.remove('show');
  msg.textContent = err.textContent = '';

  if (!email) {
    err.textContent = 'Por favor, digite seu e-mail';
    return err.classList.add('show');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    err.textContent = 'Digite um e-mail válido';
    return err.classList.add('show');
  }

  btn.disabled    = true;
  btn.textContent = 'Enviando...';

  try {
    const res    = await fetch(RECOVERY_WEBHOOK_URL, {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({ email })
    });
    const result = await res.json();

    if (result.success) {
      msg.textContent = 'Link enviado! Verifique seu e-mail.';
      msg.classList.add('show');
      setTimeout(() => {
        document.getElementById('recoveryPopup').style.display = 'none';
        clearRecoveryForm();
      }, 3000);
    } else {
      err.textContent = result.message || 'Erro interno.';
      err.classList.add('show');
    }
  } catch (e) {
    err.textContent = 'Erro ao conectar.';
    err.classList.add('show');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Enviar Link de Recuperação';
  }
});

function clearRecoveryForm() {
  document.getElementById('recoveryEmail').value = '';
  document.getElementById('recoveryMessage').classList.remove('show');
  document.getElementById('recoveryError').classList.remove('show');
}

document.getElementById('recoveryPopup').addEventListener('click', e => {
  if (e.target === document.getElementById('recoveryPopup')) {
    document.getElementById('recoveryPopup').style.display = 'none';
    clearRecoveryForm();
  }
});

// Permite Enter nos formulários
['email','password','recoveryEmail'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      if (id === 'email') document.getElementById('password').focus();
      else if (id === 'password') document.getElementById('loginButton').click();
      else document.getElementById('sendRecoveryBtn').click();
    }
  });
});

// Helpers de formatação
function formatNumber(num) {
  if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
  return num.toString();
}
function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

// Cria o card de vídeo
function createVideoCard(video, index) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    <div class="video-wrapper">
      <video class="video-player" controls preload="metadata">
        <source src="${video.play}" type="video/mp4">
        Seu navegador não suporta vídeo.
      </video>
    </div>
    <div class="video-info">
      <div class="video-title">${video.title || 'Sem título'}</div>
      <div class="video-author">
        <div class="author-avatar">${getInitials(video.author?.nickname)}</div>
        <span class="author-name">@${video.author?.nickname || 'usuario'}</span>
      </div>
      <div class="video-stats">
        <div class="stats-left">
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
    </div>
  `;
  return card;
}

// Busca vídeos e salva histórico
document.getElementById('searchBtn').addEventListener('click', async () => {
  if (!userId) {
    alert('Você precisa fazer login primeiro!');
    return;
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

// Enter na busca
document.querySelectorAll('#keyword, .form-input, .select-input').forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && userId) {
      document.getElementById('searchBtn').click();
    }
  });
});

// Logout opcional
function logout() {
  deleteCookie('tiktok_user_id');
  deleteCookie('tiktok_user_email');
  userId = null;
  document.getElementById('loginPopup').style.display = 'flex';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('email').focus();
}

// Adiciona botão de logout com dimensões fixas corrigidas
function addLogoutButton() {
  if (getCookie('tiktok_user_id')) {
    const headerActions = document.querySelector('.header-actions');
    const logoutBtn     = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.className   = 'logout-btn';
    Object.assign(logoutBtn.style, {
      background:   'linear-gradient(135deg,var(--tiktok-red),var(--tiktok-accent) 50%,var(--tiktok-cyan))',
      border:       'none',
      color:        'var(--tiktok-white)',
      padding:      '10px 20px',
      borderRadius: '16px',
      fontSize:     '12px',
      fontWeight:   '700',
      cursor:       'pointer',
      textTransform:'uppercase',
      letterSpacing:'1px',
      textDecoration: 'none',
      transition:   'all .3s ease',
      boxShadow:    '0 4px 15px rgba(254,44,85,0.3)',
      width:        '80px',
      height:       '40px',
      display:      'flex',
      justifyContent: 'center',
      alignItems:   'center'
    });
    logoutBtn.addEventListener('click', logout);
    logoutBtn.addEventListener('mouseenter', () => {
      logoutBtn.style.transform   = 'translateY(-2px)';
      logoutBtn.style.boxShadow   = '0 6px 20px rgba(254,44,85,0.4)';
    });
    logoutBtn.addEventListener('mouseleave', () => {
      logoutBtn.style.transform   = 'translateY(0)';
      logoutBtn.style.boxShadow   = '0 4px 15px rgba(254,44,85,0.3)';
    });
    headerActions.appendChild(logoutBtn);
  }
}

// Auto-focus
window.addEventListener('load', () => {
  if (!checkExistingLogin()) {
    document.getElementById('email').focus();
  } else {
    setTimeout(() => document.getElementById('keyword').focus(), 100);
    addLogoutButton();
  }
});
