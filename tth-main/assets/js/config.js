// Configurações da aplicação
const CONFIG = {
  // URLs dos webhooks
  WEBHOOKS: {
    LOGIN: 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547',
    SEARCH: 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/b024bddc-64a5-4561-b0b2-4aba543cf499',
    RECOVERY: 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/password-recovery'
  },
  
  // Configurações de cookies
  COOKIES: {
    USER_ID: 'tiktok_user_id',
    USER_EMAIL: 'tiktok_user_email',
    SEARCH_HISTORY: 'searchHistory',
    FAVORITES: 'favorites'
  },
  
  // Configurações de cache
  CACHE: {
    SEARCH_HISTORY_DAYS: 1,
    USER_SESSION_DAYS: 7,
    FAVORITES_DAYS: 30
  },
  
  // Configurações de paginação
  PAGINATION: {
    ITEMS_PER_PAGE: 12,
    INFINITE_SCROLL_THRESHOLD: 100
  },
  
  // Configurações de animação
  ANIMATION: {
    DURATION: 300,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Configurações de validação
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 6,
    MAX_KEYWORD_LENGTH: 100
  },
  
  // Configurações de notificações
  NOTIFICATIONS: {
    AUTO_HIDE_DELAY: 5000,
    POSITION: 'top-right'
  },
  
  // Configurações de lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px'
  }
};

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
} 