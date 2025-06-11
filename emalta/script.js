const LOGIN_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547';
const TRENDING_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/trending-videos-24h';
const RECOVERY_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/password-recovery';

let trendingData = [];
let userId = null;
let refreshInterval = null;

// Cookies (mesmo sistema da página original)
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

// Verifica login salvo
function checkExistingLogin() {
  const savedUserId = getCookie('tiktok_user_id');
  const savedEmail = getCookie('tiktok_user_email');
  if (savedUserId && savedEmail) {
    userId = savedUserId;
    document.getElementById('loginPopup').style.display = 'none';
    console.log('Login restaurado:', savedEmail);
    return true;
  }
  return false;
}

// Eventos de login (mesmo da página original)
document.getElementById('loginButton').addEventListener('click', async () => {
  const loginBtn = document.getElementById('loginButton');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginError = document.getElementById('loginError');
  loginError.classList.remove('show');
  loginError.textContent = '';

  if (!email || !password) {
    loginError.textContent = 'Por favor, preencha todos os campos';
    return loginError.classList.add('show');
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando...';

  try {
    const res = await fetch(LOGIN_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();

    if (result.success) {
      userId = result.userId;
      setCookie('tiktok_user_id', userId, 7);
      setCookie('tiktok_user_email', email, 7);
      document.getElementById('loginPopup').style.display = 'none';
      loadTrendingVideos();
    } else {
      loginError.textContent = result.message || 'Login inválido.';
      loginError.classList.add('show');
    }
  } catch (err) {
    loginError.textContent = 'Erro ao conectar. Verifique sua internet.';
    loginError.classList.add('show');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar Agora';
  }
});

// Recovery password (mesmo da página original)
document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'flex';
  document.getElementById('recoveryEmail').focus();
});

document.getElementById('backToLoginBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'none';
  clearRecoveryForm();
  document.getElementById('email').focus();
});

document.getElementById('closeRecoveryBtn').addEventListener('click', () => {
  document.getElementById('recoveryPopup').style.display = 'none';
  clearRecoveryForm();
});

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

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const res = await fetch(RECOVERY_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
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
    btn.disabled = false;
    btn.textContent = 'Enviar Link de Recuperação';
  }
});

function clearRecoveryForm() {
  document.getElementById('recoveryEmail').value = '';
  document.getElementById('recoveryMessage').classList.remove('show');
  document.getElementById('recoveryError').classList.remove('show');
}

// Helpers de formatação
function formatNumber(num) {
  if (num >= 1e9) return (num/1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
  return num.toString();
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffHours >= 1) return `${diffHours}h atrás`;
  if (diffMins >= 1) return `${diffMins}min atrás`;
  return 'Agora mesmo';
}

function getRankingBadge(rank) {
  const badges = {
    1: '🥇 #1',
    2: '🥈 #2', 
    3: '🥉 #3'
  };
  
  if (rank <= 3) {
    return `<div class="ranking-badge top-3">${badges[rank]}</div>`;
  } else {
    return `<div class="ranking-badge">#${rank}</div>`;
  }
}

// Cria o card de vídeo com ranking
function createTrendingVideoCard(video, rank) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    ${getRankingBadge(rank)}
    <div class="video-wrapper">
      <video class="video-player" controls preload="metadata">
        <source src="${video.play || video.video_url}" type="video/mp4">
        Seu navegador não suporta vídeo.
      </video>
    </div>
    <div class="video-info">
      <div class="video-title">${video.title || video.desc || 'Sem título'}</div>
      <div class="video-author">
        <div class="author-avatar">${getInitials(video.author?.nickname || video.author_name)}</div>
        <span class="author-name">@${video.author?.nickname || video.author_name || 'usuario'}</span>
      </div>
      <div class="video-stats">
        <div class="stats-left">
          <div class="stat-item" title="Visualizações">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            ${formatNumber(video.play_count || video.views || 0)}
          </div>
          <div class="stat-item" title="Curtidas">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${formatNumber(video.digg_count || video.likes || 0)}
          </div>
          <div class="stat-item" title="Comentários">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            ${formatNumber(video.comment_count || video.comments || 0)}
          </div>
          <div class="stat-item" title="Compartilhamentos">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            ${formatNumber(video.share_count || video.shares || 0)}
          </div>
        </div>
      </div>
    </div>
  `;
  return card;
}

// Atualiza as estatísticas do header
function updateHeaderStats(data) {
  const totalVideos = data.videos?.length || 0;
  const totalViews = data.videos?.reduce((sum, v) => sum + (v.play_count || v.views || 0), 0) || 0;
  const regions = data.videos?.map(v => v.region).filter(Boolean) || [];
  const topRegion = regions.length > 0 ? 
    regions.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    ) : '--';
  
  document.getElementById('totalVideos').textContent = formatNumber(totalVideos);
  document.getElementById('totalViews').textContent = formatNumber(totalViews);
  document.getElementById('topRegion').textContent = topRegion.toUpperCase() || '--';
  document.getElementById('lastUpdate').textContent = getTimeAgo(data.last_updated || new Date());
}

// Filtra os vídeos
function filterVideos() {
  const regionFilter = document.getElementById('regionFilter').value;
  const periodFilter = parseInt(document.getElementById('periodFilter').value);
  
  let filteredVideos = [...trendingData];
  
  // Filtro por região
  if (regionFilter) {
    filteredVideos = filteredVideos.filter(video => 
      video.region === regionFilter || video.search_region === regionFilter
    );
  }
  
  // Filtro por período (simula filtrar por timestamp)
  if (periodFilter < 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - periodFilter);
    filteredVideos = filteredVideos.filter(video => {
      const videoTime = new Date(video.created_time || video.timestamp || Date.now());
      return videoTime >= cutoffTime;
    });
  }
  
  renderVideos(filteredVideos);
}

// Renderiza os vídeos
function renderVideos(videos) {
  const grid = document.getElementById('videosGrid');
  grid.innerHTML = '';
  
  if (videos.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="emoji">😔</span>
        <h3>Nenhum vídeo encontrado</h3>
        <p>Tente ajustar os filtros ou aguarde novos vídeos trending</p>
      </div>`;
    return;
  }
  
  videos.forEach((video, index) => {
    const rank = index + 1;
    grid.appendChild(createTrendingVideoCard(video, rank));
  });
}

// Carrega vídeos trending
async function loadTrendingVideos() {
  if (!userId) {
    alert('Você precisa fazer login primeiro!');
    return;
  }

  const loading = document.getElementById('loading');
  const refreshBtn = document.getElementById('refreshBtn');
  
  loading.style.display = 'flex';
  refreshBtn.classList.add('loading');
  refreshBtn.disabled = true;

  try {
    const res = await fetch(TRENDING_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ 
        userId,
        period: document.getElementById('periodFilter').value,
        region: document.getElementById('regionFilter').value
      })
    });
    
    const data = await res.json();

    if (data.success && data.videos) {
      // Ordena por visualizações (decrescente)
      trendingData = data.videos.sort((a, b) => {
        const viewsA = a.play_count || a.views || 0;
        const viewsB = b.play_count || b.views || 0;
        return viewsB - viewsA;
      });
      
      updateHeaderStats(data);
      renderVideos(trendingData);
      
      console.log(`Carregados ${trendingData.length} vídeos trending`);
    } else {
      document.getElementById('videosGrid').innerHTML = `
        <div class="error-state">
          <span class="emoji">❌</span>
          <h3>Ops! Algo deu errado</h3>
          <p>${data.message || 'Erro ao carregar vídeos trending'}</p>
        </div>`;
    }
  } catch (err) {
    console.error('Erro ao carregar trending:', err);
    document.getElementById('videosGrid').innerHTML = `
      <div class="error-state">
        <span class="emoji">⚠️</span>
        <h3>Erro na conexão</h3>
        <p>Verifique sua internet e tente novamente</p>
      </div>`;
  } finally {
    loading.style.display = 'none';
    refreshBtn.classList.remove('loading');
    refreshBtn.disabled = false;
  }
}

// Event listeners
document.getElementById('refreshBtn').addEventListener('click', loadTrendingVideos);

document.getElementById('regionFilter').addEventListener('change', filterVideos);
document.getElementById('periodFilter').addEventListener('change', () => {
  filterVideos();
  // Recarrega os dados se mudar o período
  loadTrendingVideos();
});

// Enter nos inputs de login
['email','password','recoveryEmail'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      if (id === 'email') document.getElementById('password').focus();
      else if (id === 'password') document.getElementById('loginButton').click();
      else document.getElementById('sendRecoveryBtn').click();
    }
  });
});

// Auto-refresh a cada 5 minutos
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (userId) {
      console.log('Auto-refresh dos vídeos trending');
      loadTrendingVideos();
    }
  }, 5 * 60 * 1000); // 5 minutos
}

// Cleanup do auto-refresh
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Logout
function logout() {
  deleteCookie('tiktok_user_id');
  deleteCookie('tiktok_user_email');
  userId = null;
  stopAutoRefresh();
  document.getElementById('loginPopup').style.display = 'flex';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('email').focus();
}

// Inicialização
window.addEventListener('load', () => {
  if (!checkExistingLogin()) {
    document.getElementById('email').focus();
  } else {
    loadTrendingVideos();
    startAutoRefresh();
  }
});

// Botão de logout se logado
if (getCookie('tiktok_user_id')) {
  const headerActions = document.querySelector('.header-actions');
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Sair';
  logoutBtn.className = 'logout-btn';
  Object.assign(logoutBtn.style, {
    background: 'linear-gradient(135deg,var(--tiktok-red),var(--tiktok-accent) 50%,var(--tiktok-cyan))',
    border: 'none',
    color: 'var(--tiktok-white)',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginLeft: '16px'
  });
  logoutBtn.addEventListener('click', logout);
  headerActions.appendChild(logoutBtn);
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', stopAutoRefresh);