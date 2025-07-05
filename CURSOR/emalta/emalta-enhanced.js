// Enhanced functionality for Em Alta page
// Complementa as funcionalidades do script.js principal

// Estado específico da página Em Alta
let emaltaState = {
  autoRefreshInterval: null,
  autoRefreshEnabled: false,
  filtersActive: false,
  defaultFilters: {
    keyword: '',
    region: '',
    period: '',
    sortBy: '0'
  },
  lastRefreshTime: null,
  refreshIntervalMinutes: 5
};

// Aguarda o carregamento do DOM e do script principal
document.addEventListener('DOMContentLoaded', function() {
  // Aguarda um pouco para garantir que o script principal foi carregado
  setTimeout(initializeEmaltaFeatures, 100);
});

function initializeEmaltaFeatures() {
  console.log('Inicializando funcionalidades avançadas da Em Alta...');
  
  // Configurar filtros avançados
  setupAdvancedFilters();
  
  // Configurar botão restaurar
  setupRestoreButton();
  
  // Configurar auto-refresh
  setupAutoRefresh();
  
  // Configurar eventos específicos
  setupEmaltaEvents();
  
  // Sobrescrever algumas funções do script principal se necessário
  enhanceMainScript();
}

function setupAdvancedFilters() {
  // Configurar filtros com valores padrão
  document.getElementById('keyword').value = emaltaState.defaultFilters.keyword;
  document.getElementById('region').value = emaltaState.defaultFilters.region;
  document.getElementById('period').value = emaltaState.defaultFilters.period;
  document.getElementById('sortBy').value = emaltaState.defaultFilters.sortBy;
  
  // Adicionar event listeners para filtros
  const filterElements = ['keyword', 'region', 'period', 'sortBy'];
  
  filterElements.forEach(filterId => {
    const element = document.getElementById(filterId);
    if (element) {
      if (filterId === 'keyword') {
        // Debounce para palavra-chave
        let debounceTimer;
        element.addEventListener('input', function() {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            checkFiltersAndApply();
          }, 300);
        });
      } else {
        element.addEventListener('change', checkFiltersAndApply);
      }
    }
  });
}

function setupRestoreButton() {
  const restoreBtn = document.getElementById('clearAllBtn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', restoreDefaultFilters);
    updateRestoreButtonVisibility();
  }
}

function setupAutoRefresh() {
  // Auto-refresh será ativado apenas quando filtros estiverem no padrão
  // e houver dados carregados
  updateAutoRefreshStatus();
}

function setupEmaltaEvents() {
  // Substituir o evento do botão de busca
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    // Remover listeners anteriores
    searchBtn.replaceWith(searchBtn.cloneNode(true));
    const newSearchBtn = document.getElementById('searchBtn');
    newSearchBtn.addEventListener('click', handleAdvancedSearch);
  }
  
  // Adicionar eventos específicos da página Em Alta
  window.addEventListener('beforeunload', () => {
    if (emaltaState.autoRefreshInterval) {
      clearInterval(emaltaState.autoRefreshInterval);
    }
  });
}

function enhanceMainScript() {
  // Sobrescrever a função de carregamento de vídeos se existir
  if (typeof window.loadVideos === 'function') {
    window.originalLoadVideos = window.loadVideos;
    window.loadVideos = loadVideosEnhanced;
  }
  
  // Sobrescrever a função de renderização se existir
  if (typeof window.renderVideos === 'function') {
    window.originalRenderVideos = window.renderVideos;
    window.renderVideos = renderVideosEnhanced;
  }
}

function checkFiltersAndApply() {
  const currentFilters = getCurrentFilters();
  
  // Verificar se algum filtro foi alterado
  emaltaState.filtersActive = !areFiltersDefault(currentFilters);
  
  // Aplicar filtros
  applyAdvancedFilters(currentFilters);
  
  // Atualizar botão restaurar
  updateRestoreButtonVisibility();
  
  // Atualizar auto-refresh
  updateAutoRefreshStatus();
}

function getCurrentFilters() {
  return {
    keyword: document.getElementById('keyword').value.trim(),
    region: document.getElementById('region').value,
    period: document.getElementById('period').value,
    sortBy: document.getElementById('sortBy').value
  };
}

function areFiltersDefault(filters) {
  return filters.keyword === emaltaState.defaultFilters.keyword &&
         filters.region === emaltaState.defaultFilters.region &&
         filters.period === emaltaState.defaultFilters.period &&
         filters.sortBy === emaltaState.defaultFilters.sortBy;
}

function applyAdvancedFilters(filters) {
  // Se existe a função de busca do script principal, usá-la
  if (typeof window.searchVideos === 'function') {
    window.searchVideos();
  } else {
    // Senão, usar nossa própria implementação
    performAdvancedSearch(filters);
  }
}

async function performAdvancedSearch(filters) {
  console.log('Executando busca avançada com filtros:', filters);
  
  // Mostrar loading
  const loading = document.getElementById('loading');
  const grid = document.getElementById('videosGrid');
  
  if (loading) loading.style.display = 'flex';
  if (grid) grid.innerHTML = '';
  
  // Usar a mesma URL da busca principal do script.js
  const SEARCH_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/b024bddc-64a5-4561-b0b2-4aba543cf499';
  
  try {
    // Mapear filtros para o formato esperado pela API
    const requestData = {
      keyword: filters.keyword || '',
      region: filters.region || '',
      period: filters.period || '',
      sortBy: filters.sortBy || '0',
      userId: window.userId || 'emalta_user'
    };
    
    const response = await fetch(SEARCH_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (data.success && data.videos) {
      window.videosData = data.videos;
      
      if (data.videos.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <span class="emoji">😕</span>
            <h3>Nenhum vídeo encontrado</h3>
            <p>Tente outras palavras-chave ou filtros</p>
          </div>
        `;
      } else {
        // Usar a função createVideoCard do script principal
        data.videos.forEach((video, index) => {
          if (typeof window.createVideoCard === 'function') {
            const card = window.createVideoCard(video, index);
            grid.appendChild(card);
          } else {
            // Fallback básico se a função não estiver disponível
            grid.innerHTML += `
              <div class="video-card">
                <div class="video-wrapper">
                  <video class="video-player" controls>
                    <source src="${video.play}" type="video/mp4">
                  </video>
                </div>
                <div class="video-info">
                  <div class="video-title">${video.title || 'Sem título'}</div>
                  <div class="video-author">@${video.author?.nickname || 'usuario'}</div>
                </div>
              </div>
            `;
          }
        });
        
        // Aplicar melhorias específicas da Em Alta
        enhanceVideoCards();
      }
    } else {
      grid.innerHTML = `
        <div class="error-state">
          <span class="emoji">❌</span>
          <h3>Erro na busca</h3>
          <p>${data.message || 'Tente novamente'}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro na busca avançada:', error);
    grid.innerHTML = `
      <div class="error-state">
        <span class="emoji">⚠️</span>
        <h3>Erro de conexão</h3>
        <p>Verifique sua internet e tente novamente</p>
      </div>
    `;
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function restoreDefaultFilters() {
  // Restaurar valores padrão
  document.getElementById('keyword').value = emaltaState.defaultFilters.keyword;
  document.getElementById('region').value = emaltaState.defaultFilters.region;
  document.getElementById('period').value = emaltaState.defaultFilters.period;
  document.getElementById('sortBy').value = emaltaState.defaultFilters.sortBy;
  
  // Marcar como não ativo
  emaltaState.filtersActive = false;
  
  // Recarregar dados
  if (typeof window.loadVideos === 'function') {
    window.loadVideos();
  }
  
  // Atualizar interface
  updateRestoreButtonVisibility();
  updateAutoRefreshStatus();
  
  // Iniciar auto-refresh
  startAutoRefresh();
}

function updateRestoreButtonVisibility() {
  const restoreBtn = document.getElementById('clearAllBtn');
  if (restoreBtn) {
    if (emaltaState.filtersActive) {
      restoreBtn.style.display = 'inline-block';
    } else {
      restoreBtn.style.display = 'none';
    }
  }
}

function updateAutoRefreshStatus() {
  if (emaltaState.filtersActive) {
    stopAutoRefresh();
  } else {
    // Auto-refresh apenas quando filtros estão no padrão
    startAutoRefresh();
  }
}

function startAutoRefresh() {
  if (emaltaState.autoRefreshInterval) {
    clearInterval(emaltaState.autoRefreshInterval);
  }
  
  emaltaState.autoRefreshEnabled = true;
  emaltaState.lastRefreshTime = new Date();
  
  emaltaState.autoRefreshInterval = setInterval(() => {
    console.log('Auto-refresh executado');
    if (typeof window.loadVideos === 'function') {
      window.loadVideos();
    }
    emaltaState.lastRefreshTime = new Date();
  }, emaltaState.refreshIntervalMinutes * 60 * 1000);
  
  console.log(`Auto-refresh iniciado (${emaltaState.refreshIntervalMinutes} minutos)`);
}

function stopAutoRefresh() {
  if (emaltaState.autoRefreshInterval) {
    clearInterval(emaltaState.autoRefreshInterval);
    emaltaState.autoRefreshInterval = null;
  }
  
  emaltaState.autoRefreshEnabled = false;
  console.log('Auto-refresh parado');
}



function handleAdvancedSearch() {
  const filters = getCurrentFilters();
  console.log('Busca avançada iniciada:', filters);
  
  // Marcar filtros como ativos se não estiverem no padrão
  emaltaState.filtersActive = !areFiltersDefault(filters);
  
  // Aplicar filtros
  applyAdvancedFilters(filters);
  
  // Atualizar interface
  updateRestoreButtonVisibility();
  updateAutoRefreshStatus();
}

function loadVideosEnhanced() {
  console.log('Carregando vídeos com funcionalidades avançadas...');
  
  // Chamar a função original se existir
  if (typeof window.originalLoadVideos === 'function') {
    window.originalLoadVideos();
  }
  
  // Adicionar funcionalidades específicas da Em Alta
  const filters = getCurrentFilters();
  if (!areFiltersDefault(filters)) {
    // Se filtros estão ativos, aplicar lógica específica
    console.log('Aplicando filtros personalizados:', filters);
  }
}

function renderVideosEnhanced() {
  console.log('Renderizando vídeos com melhorias...');
  
  // Chamar a função original se existir
  if (typeof window.originalRenderVideos === 'function') {
    window.originalRenderVideos();
  }
  
  // Adicionar melhorias específicas da Em Alta
  enhanceVideoCards();
}

function enhanceVideoCards() {
  // Adicionar funcionalidades extras aos cards de vídeo
  const videoCards = document.querySelectorAll('.video-card');
  
  videoCards.forEach((card, index) => {
    // Adicionar indicador de "Em Alta" se aplicável
    if (!card.querySelector('.trending-badge')) {
      const trendingBadge = document.createElement('div');
      trendingBadge.className = 'trending-badge';
      trendingBadge.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, var(--tiktok-red), var(--tiktok-cyan));
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        z-index: 3;
      `;
      trendingBadge.innerHTML = '🔥 Em Alta';
      
      const videoWrapper = card.querySelector('.video-wrapper');
      if (videoWrapper) {
        videoWrapper.appendChild(trendingBadge);
      }
    }
  });
}

// Função utilitária para formatar tempo de último refresh
function getLastRefreshTime() {
  if (!emaltaState.lastRefreshTime) return 'Nunca';
  
  const now = new Date();
  const diff = now - emaltaState.lastRefreshTime;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Agora mesmo';
  if (minutes === 1) return 'Há 1 minuto';
  return `Há ${minutes} minutos`;
}

// Função para debug - mostrar status atual
function getEmaltaStatus() {
  return {
    autoRefreshEnabled: emaltaState.autoRefreshEnabled,
    filtersActive: emaltaState.filtersActive,
    lastRefreshTime: getLastRefreshTime(),
    currentFilters: getCurrentFilters()
  };
}

// Expor funções para debug
window.emaltaDebug = {
  getStatus: getEmaltaStatus,
  startAutoRefresh: startAutoRefresh,
  stopAutoRefresh: stopAutoRefresh,
  restoreFilters: restoreDefaultFilters
};

// Função para toggle da senha (chamada no HTML)
function togglePasswordPopup() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIconPopup');
  
  if (passwordInput && toggleIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      toggleIcon.textContent = '👁️';
    }
  }
}

// Tornar função global para ser chamada do HTML
window.togglePasswordPopup = togglePasswordPopup;

// Função para aplicar classes de floating label
function setupFloatingLabels() {
  const floatingInputs = document.querySelectorAll('.floating-input-group-popup input');
  
  floatingInputs.forEach(input => {
    // Verificar se já tem conteúdo
    if (input.value.trim() !== '') {
      input.classList.add('has-content');
    }
    
    // Eventos para gerenciar classes
    input.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.classList.add('has-content');
        this.classList.add('typing');
      } else {
        this.classList.remove('has-content');
        this.classList.remove('typing');
        this.classList.remove('completed');
      }
    });
    
    input.addEventListener('focus', function() {
      this.classList.add('typing');
    });
    
    input.addEventListener('blur', function() {
      this.classList.remove('typing');
      if (this.value.trim() !== '') {
        this.classList.add('completed');
      } else {
        this.classList.add('focus-lost');
        setTimeout(() => {
          this.classList.remove('focus-lost');
        }, 500);
      }
    });
  });
}

// Integrar floating labels na inicialização
function initializeEmaltaFeatures() {
  console.log('Inicializando funcionalidades avançadas da Em Alta...');
  
  // Configurar floating labels
  setupFloatingLabels();
  
  // Configurar filtros avançados
  setupAdvancedFilters();
  
  // Configurar botão restaurar
  setupRestoreButton();
  
  // Configurar auto-refresh
  setupAutoRefresh();
  
  // Configurar eventos específicos
  setupEmaltaEvents();
  
  // Sobrescrever algumas funções do script principal se necessário
  enhanceMainScript();
}

console.log('Funcionalidades avançadas da Em Alta carregadas!'); 