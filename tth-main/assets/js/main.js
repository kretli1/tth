// TikTop Hooks - JavaScript Principal

// Variáveis globais
let authManager;
let videoManager;

// Inicialização da aplicação
class App {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Aguardar carregamento do DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupApp());
      } else {
        this.setupApp();
      }
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      Utils.NotificationManager.error('Erro ao carregar a aplicação');
    }
  }

  setupApp() {
    // Inicializar gerenciadores
    authManager = new AuthManager();
    videoManager = new VideoManager();

    // Configurar logos flutuantes
    this.setupFloatingLogos();

    // Configurar auto-focus
    this.setupAutoFocus();

    // Configurar service worker (PWA)
    this.setupServiceWorker();

    // Configurar analytics
    this.setupAnalytics();

    // Configurar atalhos de teclado
    this.setupKeyboardShortcuts();

    // Configurar notificações push
    this.setupPushNotifications();

    // Configurar modo offline
    this.setupOfflineMode();

    console.log('TikTop Hooks inicializado com sucesso!');
  }

  // Configurar logos flutuantes
  setupFloatingLogos() {
    const logosContainer = document.getElementById('tikTokLogos');
    if (logosContainer) {
      // Criar muitos logos flutuantes com diferentes tamanhos
      const logoSizes = [20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
      const animationDelays = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];
      
      // Posições estratégicas para distribuir os logos (ajustadas para área abaixo do header)
      const positions = [
        // Área superior esquerda
        { left: '5%', top: '5%' },
        { left: '15%', top: '12%' },
        { left: '8%', top: '20%' },
        
        // Área superior direita
        { left: '85%', top: '8%' },
        { left: '92%', top: '15%' },
        { left: '88%', top: '22%' },
        
        // Área central esquerda
        { left: '12%', top: '30%' },
        { left: '6%', top: '40%' },
        { left: '18%', top: '50%' },
        
        // Área central direita
        { left: '82%', top: '35%' },
        { left: '94%', top: '45%' },
        { left: '86%', top: '55%' },
        
        // Área inferior esquerda
        { left: '10%', top: '65%' },
        { left: '20%', top: '75%' },
        { left: '5%', top: '85%' },
        
        // Área inferior direita
        { left: '80%', top: '70%' },
        { left: '90%', top: '80%' },
        { left: '95%', top: '90%' },
        
        // Centro da área disponível
        { left: '45%', top: '25%' },
        { left: '35%', top: '35%' },
        { left: '65%', top: '45%' },
        { left: '55%', top: '60%' },
        { left: '40%', top: '80%' },
        { left: '60%', top: '70%' }
      ];
      
      // Criar 24 logos com posições estratégicas
      for (let i = 0; i < 24; i++) {
        const logo = Utils.DOMUtils.createElement('div', 'tiktok-logo-floating');
        const sizeIndex = i % logoSizes.length;
        const size = logoSizes[sizeIndex];
        const delay = animationDelays[sizeIndex];
        const position = positions[i % positions.length];
        
        logo.innerHTML = `<img src="https://icones.pro/wp-content/uploads/2021/03/logo-icone-tiktok.png" alt="TikTok">`;
        logo.style.width = `${size}px`;
        logo.style.height = `${size}px`;
        logo.style.animationDelay = `${delay}s`;
        logo.style.left = position.left;
        logo.style.top = position.top;
        
        logosContainer.appendChild(logo);
      }
    }
  }

  // Configurar auto-focus
  setupAutoFocus() {
    if (!authManager.isLoggedIn()) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100);
      }
    } else {
      const keywordInput = document.getElementById('keyword');
      if (keywordInput) {
        setTimeout(() => keywordInput.focus(), 100);
      }
    }
  }

  // Configurar service worker
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.log('Service Worker falhou:', error);
      }
    }
  }

  // Configurar analytics
  setupAnalytics() {
    // Implementar analytics aqui
    window.addEventListener('load', () => {
      // Google Analytics ou similar
      if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID');
      }
    });
  }

  // Configurar atalhos de teclado
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K para focar na busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const keywordInput = document.getElementById('keyword');
        if (keywordInput && authManager.isLoggedIn()) {
          keywordInput.focus();
        }
      }

      // Ctrl/Cmd + L para logout
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (authManager.isLoggedIn()) {
          authManager.logout();
        }
      }

      // Escape para fechar popups
      if (e.key === 'Escape') {
        const popups = document.querySelectorAll('.popup, .recovery-popup');
        popups.forEach(popup => {
          if (popup.style.display === 'flex') {
            popup.style.display = 'none';
          }
        });
      }
    });
  }

  // Configurar notificações push
  setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notificações push permitidas');
        }
      });
    }
  }

  // Configurar modo offline
  setupOfflineMode() {
    window.addEventListener('online', () => {
      Utils.NotificationManager.success('Conexão restaurada!');
    });

    window.addEventListener('offline', () => {
      Utils.NotificationManager.warning('Você está offline. Algumas funcionalidades podem não funcionar.');
    });
  }
}

// Funções utilitárias globais
window.TikTopHooks = {
  // Obter instâncias dos gerenciadores
  getAuthManager: () => authManager,
  getVideoManager: () => videoManager,

  // Funções de conveniência
  showNotification: (message, type) => Utils.NotificationManager.show(message, type),
  formatNumber: (num) => Utils.NumberFormatter.format(num),
  formatDate: (date) => Utils.NumberFormatter.formatDate(date),

  // Funções de debug
  debug: {
    getState: () => ({
      auth: authManager?.getUserData(),
      videos: videoManager?.videosData?.length || 0,
      favorites: videoManager?.favorites?.length || 0,
      searchHistory: videoManager?.searchHistory?.length || 0
    }),
    
    clearCache: () => {
      Utils.CacheManager.clear();
      Utils.NotificationManager.success('Cache limpo!');
    },
    
    exportData: () => {
      const data = {
        auth: authManager?.getUserData(),
        favorites: videoManager?.favorites,
        searchHistory: videoManager?.searchHistory,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiktophooks-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};

// Inicializar aplicação quando o script for carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}

// Expor funções globais para compatibilidade
window.formatNumber = Utils.NumberFormatter.format;
window.getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

// Configurar tratamento de erros global
window.addEventListener('error', (event) => {
  console.error('Erro global:', event.error);
  Utils.NotificationManager.error('Ocorreu um erro inesperado');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada:', event.reason);
  Utils.NotificationManager.error('Erro na operação');
});

// Configurar performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('Performance:', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        });
      }
    }, 0);
  });
} 