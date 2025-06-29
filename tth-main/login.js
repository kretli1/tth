// JavaScript para o novo design de login com logs detalhados
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🚀 [LOGIN] Inicializando página de login...');
    
    // Elementos do novo design
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('loginError');
    const successMessage = document.getElementById('loginSuccess');
    
    console.log('📋 [LOGIN] Elementos capturados:', {
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        loginBtn: !!loginBtn,
        errorMessage: !!errorMessage,
        successMessage: !!successMessage
    });

    // Sistema de retry
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimer = null;

    // Criar contador visual de retry
    function createRetryCounter() {
        console.log('🔄 [RETRY] Criando contador visual de retry...');
        
        let counter = document.querySelector('.retry-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'retry-counter';
            counter.innerHTML = `
                <div class="retry-text">
                    <div class="retry-spinner"></div>
                    <span id="retryText">Tentativa 1 de ${maxRetries}...</span>
                </div>
            `;
            document.body.appendChild(counter);
        }
        return counter;
    }

    // Mostrar retry counter
    function showRetryCounter(attempt) {
        console.log(`🔄 [RETRY] Mostrando contador - Tentativa ${attempt}/${maxRetries}`);
        
        const counter = createRetryCounter();
        const retryText = document.getElementById('retryText');
        
        if (retryText) {
            retryText.textContent = `Tentativa ${attempt} de ${maxRetries}...`;
        }
        
        counter.classList.add('show');
    }

    // Esconder retry counter
    function hideRetryCounter() {
        console.log('🔄 [RETRY] Escondendo contador de retry');
        
        const counter = document.querySelector('.retry-counter');
        if (counter) {
            counter.classList.remove('show');
        }
    }
    
    // Função para mostrar mensagem de erro
    function showError(message) {
        console.log('❌ [ERROR] Mostrando erro:', message);
        
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            hideSuccess();
            
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 8000);
        }
    }
    
    // Função para mostrar mensagem de sucesso
    function showSuccess(message) {
        console.log('✅ [SUCCESS] Mostrando sucesso:', message);
        
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.add('show');
            hideError();
            
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }
    }
    
    // Função para esconder mensagem de erro
    function hideError() {
        if (errorMessage) {
            errorMessage.classList.remove('show');
        }
    }
    
    // Função para esconder mensagem de sucesso
    function hideSuccess() {
        if (successMessage) {
            successMessage.classList.remove('show');
        }
    }
    
    // Estado de loading do botão
    function setLoadingState(button, loading) {
        console.log('⏳ [LOADING] Alterando estado:', loading ? 'ATIVADO' : 'DESATIVADO');
        
        if (loading) {
            button.disabled = true;
            button.querySelector('.btn-text').style.opacity = '0';
            button.querySelector('.btn-loader').classList.remove('hidden');
        } else {
            button.disabled = false;
            button.querySelector('.btn-text').style.opacity = '1';
            button.querySelector('.btn-loader').classList.add('hidden');
        }
    }
    
    // Validação de email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        console.log('📧 [VALIDATION] Email:', email, 'Válido:', isValid);
        return isValid;
    }
    
    // Função para gerenciar cookies
    function setCookie(name, value, days) {
        console.log('🍪 [COOKIE] Definindo cookie:', name, 'Valor:', value, 'Dias:', days);
        
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
    
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                console.log('🍪 [COOKIE] Lendo cookie:', name, 'Valor:', value);
                return value;
            }
        }
        console.log('🍪 [COOKIE] Cookie não encontrado:', name);
        return null;
    }
    
    // Verificar se o usuário já está logado
    function checkExistingLogin() {
        console.log('🔐 [AUTH] Verificando login existente...');
        
        const userId = getCookie('tiktok_user_id');
        if (userId) {
            console.log('🔐 [AUTH] Usuário já logado, redirecionando...');
            window.location.href = '/';
        } else {
            console.log('🔐 [AUTH] Nenhum login encontrado');
        }
    }



    // URLs dos webhooks
    const PRIMARY_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/0bbfaeaa-d9cb-4a4d-960c-cfedf598e547';

    // Fallback quando webhook principal falha
    const FALLBACK_OPTIONS = {
        emailSupport: 'tiktophooks@support.com',
        alternativeMessage: 'Serviço temporariamente indisponível. Por favor, tente novamente em alguns minutos.'
    };

    // Função principal de login com retry automático
    async function attemptLogin(email, password, attempt = 1) {
        console.log(`🔐 [LOGIN] Tentativa ${attempt}/${maxRetries} - Email: ${email}`);
        
        if (attempt > 1) {
            showRetryCounter(attempt);
        }

        try {
            console.log('🌐 [REQUEST] Preparando requisição...');
            console.log('🌐 [REQUEST] URL:', PRIMARY_WEBHOOK_URL);
            console.log('🌐 [REQUEST] Method: POST');
            console.log('🌐 [REQUEST] Headers:', {
                'Content-Type': 'application/json'
            });
            console.log('🌐 [REQUEST] Body:', {
                email: email,
                password: '[SENHA_OCULTA]'
            });

            const startTime = performance.now();
            
            // Fazer requisição de login
            const response = await fetch(PRIMARY_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const endTime = performance.now();
            const requestTime = endTime - startTime;
            
            console.log(`🌐 [RESPONSE] Recebida em ${requestTime.toFixed(2)}ms`);
            console.log('🌐 [RESPONSE] Status:', response.status);
            console.log('🌐 [RESPONSE] StatusText:', response.statusText);
            console.log('🌐 [RESPONSE] Headers:', Object.fromEntries(response.headers.entries()));
            
            let result;
            try {
                result = await response.json();
                console.log('🌐 [RESPONSE] Body:', result);
            } catch (parseError) {
                console.log('❌ [PARSE] Erro ao fazer parse do JSON:', parseError);
                throw new Error('Resposta inválida do servidor');
            }
            
            if (response.ok && result.success) {
                console.log('✅ [LOGIN] Login bem-sucedido!');
                hideRetryCounter();
                
                // Login bem-sucedido
                setCookie('tiktok_user_id', result.user_id, 7);
                setCookie('user_email', email, 7);
                
                // Verificar checkbox "lembrar de mim"
                const rememberCheckbox = document.getElementById('remember');
                if (rememberCheckbox && rememberCheckbox.checked) {
                    setCookie('remember_login', 'true', 30);
                    console.log('🍪 [COOKIE] Lembrar login ativado por 30 dias');
                }
                
                showSuccess('Login realizado com sucesso! Redirecionando...');
                
                // Redirecionar após 1.5 segundos
                setTimeout(() => {
                    console.log('🔄 [REDIRECT] Redirecionando para página principal...');
                    window.location.href = '/';
                }, 1500);
                
                return true; // Sucesso
                
            } else {
                console.log('❌ [LOGIN] Login falhou:', result);
                
                // Se falhou e ainda temos tentativas
                if (attempt < maxRetries) {
                    console.log(`🔄 [RETRY] Tentando novamente em 2 segundos... (${attempt + 1}/${maxRetries})`);
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return await attemptLogin(email, password, attempt + 1);
                } else {
                    // Última tentativa falhou
                    hideRetryCounter();
                    const errorMsg = result.message || 'E-mail ou senha incorretos.';
                    showError(errorMsg);
                    setLoadingState(loginBtn, false);
                    return false;
                }
            }
            
        } catch (error) {
            console.log('❌ [ERROR] Erro na requisição:', error);
            console.log('❌ [ERROR] Error name:', error.name);
            console.log('❌ [ERROR] Error message:', error.message);
            console.log('❌ [ERROR] Error stack:', error.stack);
            
            // Se é erro de rede e ainda temos tentativas
            if (attempt < maxRetries) {
                console.log(`🔄 [RETRY] Erro de rede - Tentando novamente em 3 segundos... (${attempt + 1}/${maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, 3000));
                return await attemptLogin(email, password, attempt + 1);
            } else {
                // Última tentativa com erro
                hideRetryCounter();
                
                // Verificar se é erro específico de webhook inativo
                if (error.message.includes('Failed to fetch')) {
                    console.log('🚫 [FALLBACK] Erro "Failed to fetch" detectado - possível webhook inativo');
                    
                    showError(`🚫 Serviço temporariamente indisponível. Nossos servidores podem estar em manutenção. Aguarde alguns minutos e tente novamente. Contato: ${FALLBACK_OPTIONS.emailSupport}`);
                } else {
                    // Erro genérico para outros tipos de erro
                    showError('Erro de conexão. Verifique sua internet e tente novamente.');
                }
                
                setLoadingState(loginBtn, false);
                return false;
            }
        }
    }
    
    // Função principal de login
    async function handleLogin(event) {
        event.preventDefault();
        
        console.log('🔐 [LOGIN] Iniciando processo de login...');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validações apenas no envio
        console.log('🔍 [VALIDATION] Validando campos...');
        
        if (!email || !password) {
            console.log('❌ [VALIDATION] Campos vazios');
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        if (!validateEmail(email)) {
            console.log('❌ [VALIDATION] Email inválido');
            showError('Por favor, insira um e-mail válido.');
            return;
        }
        
        if (password.length < 6) {
            console.log('❌ [VALIDATION] Senha muito curta');
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        console.log('✅ [VALIDATION] Campos válidos');
        
        // Resetar contador de retry
        retryCount = 0;
        
        // Iniciar loading
        setLoadingState(loginBtn, true);
        hideError();
        hideSuccess();
        
        // Tentar login com sistema de retry
        await attemptLogin(email, password);
    }
    
    // Atribuir função de login ao window para ser acessível do HTML
    window.handleLogin = handleLogin;
    
    // Função para toggle da senha
    window.togglePassword = function() {
        console.log('👁️ [UI] Toggle de senha acionado');
        
        const passwordField = document.getElementById('password');
        const toggleIcon = document.getElementById('toggleIcon');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.textContent = '🙈';
            console.log('👁️ [UI] Senha visível');
        } else {
            passwordField.type = 'password';
            toggleIcon.textContent = '👁️';
            console.log('👁️ [UI] Senha oculta');
        }
    };
    
    // Melhorias de UX para floating labels (sem validação em tempo real)
    function enhanceFloatingLabels() {
        console.log('🏷️ [UI] Configurando floating labels...');
        
        const inputs = document.querySelectorAll('.floating-input-group-main input');
        
        inputs.forEach(input => {
            if (!input.placeholder) {
                input.placeholder = ' ';
            }
            
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                
                if (!this.value) {
                    this.parentElement.classList.remove('active');
                }
            });
            
            if (input.value) {
                input.parentElement.classList.add('active');
            }
        });
    }
    
    // Animação de entrada dos elementos
    function animateCardEntrance() {
        console.log('✨ [ANIMATION] Iniciando animação de entrada...');
        
        const card = document.querySelector('.auth-card-main');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.95)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 100);
        }
    }
    
    // Efeito de parallax no background
    function initParallaxEffect() {
        console.log('🎭 [PARALLAX] Configurando efeito parallax...');
        
        const logos = document.querySelectorAll('.simple-background .floating-logo');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            logos.forEach((logo, index) => {
                const speed = (index + 1) * 0.5;
                const x = (mouseX - 0.5) * speed * 50;
                const y = (mouseY - 0.5) * speed * 50;
                
                logo.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
    
    // Prevenir zoom no iOS
    function preventIOSZoom() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            console.log('📱 [iOS] Prevenindo zoom automático...');
            
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(e) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }
    
    // Inicializar todas as funcionalidades
    console.log('🚀 [INIT] Inicializando funcionalidades...');
    checkExistingLogin();
    enhanceFloatingLabels();
    animateCardEntrance();
    initParallaxEffect();
    preventIOSZoom();
    
    console.log('✅ [INIT] Página de login totalmente carregada!');
}); 