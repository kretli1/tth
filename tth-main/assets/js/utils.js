// Utilitários JavaScript

// Gerenciamento de cookies
const CookieManager = {
  set(name, value, days = 1) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  },

  delete(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  },

  exists(name) {
    return this.get(name) !== null;
  }
};

// Formatação de números
const NumberFormatter = {
  format(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  },

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  formatDate(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    if (days < 365) return `${Math.floor(days / 30)} meses atrás`;
    return `${Math.floor(days / 365)} anos atrás`;
  }
};

// Validação de dados
const Validator = {
  email(email) {
    return CONFIG.VALIDATION.EMAIL_REGEX.test(email);
  },

  password(password) {
    return password.length >= CONFIG.VALIDATION.MIN_PASSWORD_LENGTH;
  },

  keyword(keyword) {
    return keyword.trim().length > 0 && keyword.length <= CONFIG.VALIDATION.MAX_KEYWORD_LENGTH;
  },

  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }
};

// Sistema de notificações
const NotificationManager = {
  show(message, type = 'info', duration = CONFIG.NOTIFICATIONS.AUTO_HIDE_DELAY) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slide-in`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Adicionar estilos inline para notificação
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'var(--tiktok-darker)',
      border: '1px solid var(--tiktok-border)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-md)',
      color: 'var(--tiktok-white)',
      zIndex: 'var(--z-tooltip)',
      maxWidth: '300px',
      boxShadow: 'var(--shadow-primary)'
    });

    document.body.appendChild(notification);

    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    }

    return notification;
  },

  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
};

// Sistema de cache local
const CacheManager = {
  set(key, value, days = 1) {
    const item = {
      value,
      timestamp: Date.now(),
      expires: Date.now() + (days * 24 * 60 * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expires) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  },

  delete(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },

  exists(key) {
    return this.get(key) !== null;
  }
};

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading para imagens e vídeos
const LazyLoader = {
  init() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      }, {
        threshold: CONFIG.LAZY_LOADING.THRESHOLD,
        rootMargin: CONFIG.LAZY_LOADING.ROOT_MARGIN
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  loadImage(img) {
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = img.dataset.src;
    });
  }
};

// Helpers para DOM
const DOMUtils = {
  createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },

  addClass(element, className) {
    element.classList.add(className);
  },

  removeClass(element, className) {
    element.classList.remove(className);
  },

  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  hasClass(element, className) {
    return element.classList.contains(className);
  },

  fadeIn(element, duration = CONFIG.ANIMATION.DURATION) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  fadeOut(element, duration = CONFIG.ANIMATION.DURATION) {
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(1 - (progress / duration), 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };
    
    requestAnimationFrame(animate);
  }
};

// Exportar utilitários
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CookieManager,
    NumberFormatter,
    Validator,
    NotificationManager,
    CacheManager,
    LazyLoader,
    DOMUtils,
    debounce,
    throttle
  };
} else {
  window.Utils = {
    CookieManager,
    NumberFormatter,
    Validator,
    NotificationManager,
    CacheManager,
    LazyLoader,
    DOMUtils,
    debounce,
    throttle
  };
} 