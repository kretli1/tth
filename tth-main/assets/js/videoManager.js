// Gerenciador de Vídeos

class VideoManager {
  constructor() {
    this.videosData = [];
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreVideos = true;
    this.favorites = this.loadFavorites();
    this.searchHistory = this.loadSearchHistory();
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupInfiniteScroll();
    this.setupLazyLoading();
  }

  // Carregar favoritos
  loadFavorites() {
    const favorites = Utils.CacheManager.get(CONFIG.COOKIES.FAVORITES);
    return favorites || [];
  }

  // Salvar favoritos
  saveFavorites() {
    Utils.CacheManager.set(CONFIG.COOKIES.FAVORITES, this.favorites, CONFIG.CACHE.FAVORITES_DAYS);
  }

  // Carregar histórico de busca
  loadSearchHistory() {
    const history = Utils.CookieManager.get(CONFIG.COOKIES.SEARCH_HISTORY);
    if (!history) return [];
    try {
      return JSON.parse(history);
    } catch {
      return [];
    }
  }

  // Salvar histórico de busca
  saveSearchHistory() {
    Utils.CookieManager.set(CONFIG.COOKIES.SEARCH_HISTORY, JSON.stringify(this.searchHistory), CONFIG.CACHE.SEARCH_HISTORY_DAYS);
  }

  // Adicionar ao histórico
  addToSearchHistory(entry) {
    this.searchHistory.push(entry);
    // Manter apenas os últimos 10 itens
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(-10);
    }
    this.saveSearchHistory();
  }

  // Buscar vídeos
  async searchVideos(keyword, region, period, sortBy, page = 1) {
    if (!Utils.Validator.keyword(keyword)) {
      throw new Error('Palavra-chave inválida');
    }

    if (!authManager.isLoggedIn()) {
      throw new Error('Você precisa fazer login primeiro!');
    }

    this.isLoading = true;
    this.currentPage = page;

    try {
      const response = await fetch(CONFIG.WEBHOOKS.SEARCH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword, 
          region, 
          period, 
          sortBy: '1', // Sempre ordenar por curtidas (mais visto)
          userId: authManager.getUserData().id,
          page: this.currentPage
        })
      });

      const data = await response.json();

      if (data.success && data.videos) {
        let videos = data.videos;
        
        // Ordenação local por visualizações (mais visto para menos visto)
        videos.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
        
        if (page === 1) {
          this.videosData = videos;
        } else {
          this.videosData = [...this.videosData, ...videos];
          // Reordenar todos os vídeos após adicionar novos
          this.videosData.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
        }

        this.hasMoreVideos = data.videos.length === CONFIG.PAGINATION.ITEMS_PER_PAGE;
        
        // Salvar no histórico
        const historyEntry = {
          keyword,
          region,
          period,
          sortBy: '1', // Sempre salvar como ordenado por curtidas
          timestamp: new Date().toISOString()
        };
        this.addToSearchHistory(historyEntry);

        // Cache da busca atual
        Utils.CacheManager.set('currentSearch', {
          keyword,
          region,
          period,
          sortBy: '1',
          videos: this.videosData
        }, 1);

        return this.videosData;
      } else {
        throw new Error(data.message || 'Erro ao buscar vídeos');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro na conexão. Verifique sua internet.');
    } finally {
      this.isLoading = false;
    }
  }

  // Renderizar vídeos
  renderVideos(videos = this.videosData, append = false) {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    if (!append) {
      grid.innerHTML = '';
    }

    if (videos.length === 0) {
      grid.innerHTML = `
        <div class="empty-state animate-fade-in">
          <span class="emoji">😕</span>
          <h3>Nenhum vídeo encontrado</h3>
          <p>Tente outras palavras-chave ou filtros</p>
        </div>`;
      return;
    }

    videos.forEach((video, index) => {
      const card = this.createVideoCard(video, this.videosData.length + index);
      grid.appendChild(card);
    });

    // Aplicar lazy loading
    this.setupLazyLoading();
  }

  // Criar card de vídeo
  createVideoCard(video, index) {
    const card = Utils.DOMUtils.createElement('div', 'video-card animate-fade-in');
    const isFavorite = this.favorites.some(fav => fav.id === video.id);
    const authorNickname = video.author?.nickname || 'usuario';
    const tiktokProfileUrl = `https://www.tiktok.com/@${authorNickname}`;
    
    card.innerHTML = `
      <div class="video-wrapper">
        <video class="video-player" controls preload="metadata" data-src="${video.play}">
          <source src="${video.play}" type="video/mp4">
          Seu navegador não suporta vídeo.
        </video>
        <div class="video-overlay">
          <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-video-id="${video.id}">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="share-btn" data-video-id="${video.id}">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="video-info">
        <div class="video-title">${video.title || 'Sem título'}</div>
        <div class="video-author">
          <div class="author-avatar">${this.getInitials(authorNickname)}</div>
          <a href="${tiktokProfileUrl}" target="_blank" class="author-name" title="Ver perfil no TikTok">@${authorNickname}</a>
        </div>
        <div class="video-stats">
          <div class="stats-left">
            <div class="stat-item tooltip" data-tooltip="Visualizações">
              <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              ${Utils.NumberFormatter.format(video.play_count || 0)}
            </div>
            <div class="stat-item tooltip" data-tooltip="Curtidas">
              <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${Utils.NumberFormatter.format(video.digg_count || 0)}
            </div>
            <div class="stat-item tooltip" data-tooltip="Comentários">
              <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              ${Utils.NumberFormatter.format(video.comment_count || 0)}
            </div>
            <div class="stat-item tooltip" data-tooltip="Compartilhamentos">
              <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              ${Utils.NumberFormatter.format(video.share_count || 0)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar eventos aos botões
    this.bindVideoCardEvents(card, video);

    return card;
  }

  // Bind eventos do card de vídeo
  bindVideoCardEvents(card, video) {
    // Botão favorito
    const favoriteBtn = card.querySelector('.favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(video);
        favoriteBtn.classList.toggle('favorited');
      });
    }

    // Botão compartilhar
    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shareVideo(video);
      });
    }

    // Clique no card
    card.addEventListener('click', () => {
      this.playVideo(video);
    });
  }

  // Alternar favorito
  toggleFavorite(video) {
    const index = this.favorites.findIndex(fav => fav.id === video.id);
    
    if (index > -1) {
      this.favorites.splice(index, 1);
      Utils.NotificationManager.info('Removido dos favoritos');
    } else {
      this.favorites.push(video);
      Utils.NotificationManager.success('Adicionado aos favoritos');
    }
    
    this.saveFavorites();
  }

  // Compartilhar vídeo
  shareVideo(video) {
    if (navigator.share) {
      navigator.share({
        title: video.title || 'Vídeo do TikTok',
        text: `Confira este vídeo: ${video.title || 'Vídeo incrível'}`,
        url: video.play
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(video.play).then(() => {
        Utils.NotificationManager.success('Link copiado para a área de transferência!');
      });
    }
  }

  // Reproduzir vídeo
  playVideo(video) {
    // Implementar modal de reprodução ou redirecionamento
    window.open(video.play, '_blank');
  }

  // Obter iniciais
  getInitials(name) {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // Configurar lazy loading
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target;
            if (video.dataset.src) {
              video.src = video.dataset.src;
              video.removeAttribute('data-src');
              videoObserver.unobserve(video);
            }
          }
        });
      }, {
        threshold: CONFIG.LAZY_LOADING.THRESHOLD,
        rootMargin: CONFIG.LAZY_LOADING.ROOT_MARGIN
      });

      document.querySelectorAll('video[data-src]').forEach(video => {
        videoObserver.observe(video);
      });
    }
  }

  // Configurar scroll infinito
  setupInfiniteScroll() {
    const handleScroll = Utils.throttle(() => {
      if (this.isLoading || !this.hasMoreVideos) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - CONFIG.PAGINATION.INFINITE_SCROLL_THRESHOLD) {
        this.loadMoreVideos();
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
  }

  // Carregar mais vídeos
  async loadMoreVideos() {
    if (this.isLoading || !this.hasMoreVideos) return;

    const keyword = document.getElementById('keyword')?.value;
    const region = document.getElementById('region')?.value;
    const period = document.getElementById('period')?.value;

    if (!keyword) return;

    try {
      const newVideos = await this.searchVideos(keyword, region, period, this.currentPage + 1);
      this.renderVideos(newVideos.slice(-CONFIG.PAGINATION.ITEMS_PER_PAGE), true);
    } catch (error) {
      Utils.NotificationManager.error('Erro ao carregar mais vídeos');
    }
  }

  // Mostrar loading
  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
    }
  }

  // Ocultar loading
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Bind eventos principais
  bindEvents() {
    // Botão de busca
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', async () => {
        const keyword = document.getElementById('keyword').value.trim();
        const region = document.getElementById('region').value;
        const period = document.getElementById('period').value;

        if (!Utils.Validator.keyword(keyword)) {
          Utils.NotificationManager.error('Por favor, preencha a palavra-chave');
          return;
        }

        // Ocultar logos flutuantes
        const tikTokLogos = document.getElementById('tikTokLogos');
        if (tikTokLogos) tikTokLogos.style.display = 'none';

        // Mostrar loading
        this.showLoading();
        searchBtn.disabled = true;
        searchBtn.textContent = 'Buscando...';

        try {
          const videos = await this.searchVideos(keyword, region, period);
          this.renderVideos(videos);
        } catch (error) {
          const grid = document.getElementById('videosGrid');
          if (grid) {
            grid.innerHTML = `
              <div class="error-state animate-fade-in">
                <span class="emoji">⚠️</span>
                <h3>Erro na busca</h3>
                <p>${error.message}</p>
              </div>`;
          }
        } finally {
          this.hideLoading();
          searchBtn.disabled = false;
          searchBtn.textContent = 'Descobrir';
        }
      });
    }

    // Enter na busca
    const searchInputs = document.querySelectorAll('#keyword, .form-input, .select-input');
    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && authManager.isLoggedIn()) {
          document.getElementById('searchBtn').click();
        }
      });
    });

    // Busca em tempo real (debounced)
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) {
      const debouncedSearch = Utils.debounce(async () => {
        const keyword = keywordInput.value.trim();
        if (keyword.length >= 3 && authManager.isLoggedIn()) {
          // Implementar busca em tempo real aqui
          // this.showSearchSuggestions(keyword);
        }
      }, 500);

      keywordInput.addEventListener('input', debouncedSearch);
    }
  }

  // Obter favoritos
  getFavorites() {
    return this.favorites;
  }

  // Obter histórico de busca
  getSearchHistory() {
    return this.searchHistory;
  }

  // Limpar dados
  clearData() {
    this.videosData = [];
    this.currentPage = 1;
    this.hasMoreVideos = true;
    const grid = document.getElementById('videosGrid');
    if (grid) grid.innerHTML = '';
  }
}

// Exportar VideoManager
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoManager;
} else {
  window.VideoManager = VideoManager;
} 