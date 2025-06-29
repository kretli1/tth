// JavaScript para o novo design de recuperação de senha com logs detalhados
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🚀 [RECOVERY] Inicializando página de recuperação...');
    
    // Elementos do novo design
    const emailInput = document.getElementById('recoveryEmail');
    const recoveryBtn = document.getElementById('recoveryBtn');
    const recoveryForm = document.getElementById('recoveryForm');
    const errorMessage = document.getElementById('recoveryError');
    const successMessage = document.getElementById('recoverySuccess');
    
    console.log('📋 [RECOVERY] Elementos capturados:', {
        emailInput: !!emailInput,
        recoveryBtn: !!recoveryBtn,
        errorMessage: !!errorMessage,
        successMessage: !!successMessage
    });

    // Sistema de retry
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimer = null;

    // URLs dos webhooks
    const PRIMARY_WEBHOOK_URL = 'https://n8n-2025n8n.wjemh8.easypanel.host/webhook/6074b279-3ac1-472c-a0a3-1d6ceec7569b';

    // Fallback quando webhook principal falha
    const FALLBACK_OPTIONS = {
        emailSupport: 'tiktophooks@support.com',
        alternativeMessage: 'Serviço temporariamente indisponível. Por favor, tente novamente em alguns minutos.'
    };

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
            }, 10000);
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
            }, 12000);
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



    // Função de recuperação com retry automático
    async function attemptRecovery(email, attempt = 1) {
        console.log(`🔐 [RECOVERY] Tentativa ${attempt}/${maxRetries} - Email: ${email}`);
        
        if (attempt > 1) {
            showRetryCounter(attempt);
        }

        try {
            console.log('🌐 [REQUEST] Preparando requisição de recuperação...');
            console.log('🌐 [REQUEST] URL:', PRIMARY_WEBHOOK_URL);
            console.log('🌐 [REQUEST] Method: POST');
            console.log('🌐 [REQUEST] Headers:', {
                'Content-Type': 'application/json'
            });
            console.log('🌐 [REQUEST] Body:', {
                email: email,
                action: 'recover_password'
            });

            const startTime = performance.now();
            
            // Fazer requisição de recuperação
            const response = await fetch(PRIMARY_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    action: 'recover_password'
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
                console.log('✅ [RECOVERY] Recuperação bem-sucedida!');
                hideRetryCounter();
                
                // Recuperação bem-sucedida
                showSuccess(`✅ Instruções enviadas para ${email}! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.`);
                
                // Desabilitar o formulário por 60 segundos
                disableForm(60);
                
                return true; // Sucesso
                
            } else {
                console.log('❌ [RECOVERY] Recuperação falhou:', result);
                
                // Se falhou e ainda temos tentativas
                if (attempt < maxRetries) {
                    console.log(`🔄 [RETRY] Tentando novamente em 2 segundos... (${attempt + 1}/${maxRetries})`);
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return await attemptRecovery(email, attempt + 1);
                } else {
                    // Última tentativa falhou
                    hideRetryCounter();
                    const errorMsg = result.message || 'E-mail não encontrado ou erro no servidor.';
                    showError(errorMsg);
                    setLoadingState(recoveryBtn, false);
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
                return await attemptRecovery(email, attempt + 1);
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
                
                setLoadingState(recoveryBtn, false);
                return false;
            }
        }
    }
    
    // Função principal de recuperação
    async function handleRecovery(event) {
        event.preventDefault();
        
        console.log('🔐 [RECOVERY] Iniciando processo de recuperação...');
        
        const email = emailInput.value.trim();
        
        // Validações apenas no envio
        console.log('🔍 [VALIDATION] Validando campo de email...');
        
        if (!email) {
            console.log('❌ [VALIDATION] Email vazio');
            showError('Por favor, digite seu e-mail.');
            return;
        }
        
        if (!validateEmail(email)) {
            console.log('❌ [VALIDATION] Email inválido');
            showError('Por favor, insira um e-mail válido.');
            return;
        }
        
        console.log('✅ [VALIDATION] Email válido');
        
        // Resetar contador de retry
        retryCount = 0;
        
        // Iniciar loading
        setLoadingState(recoveryBtn, true);
        hideError();
        hideSuccess();
        
        // Tentar recuperação com sistema de retry
        await attemptRecovery(email);
    }
    
    // Desabilitar formulário temporariamente
    function disableForm(seconds) {
        console.log(`⏳ [COOLDOWN] Desabilitando formulário por ${seconds} segundos`);
        
        let countdown = seconds;
        
        setLoadingState(recoveryBtn, false);
        recoveryBtn.disabled = true;
        
        const originalText = recoveryBtn.querySelector('.btn-text').textContent;
        
        const timer = setInterval(() => {
            recoveryBtn.querySelector('.btn-text').textContent = `Aguarde ${countdown}s`;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(timer);
                recoveryBtn.disabled = false;
                recoveryBtn.querySelector('.btn-text').textContent = originalText;
                console.log('✅ [COOLDOWN] Formulário reabilitado');
            }
        }, 1000);
    }
    
    // Atribuir função de recuperação ao window para ser acessível do HTML
    window.handleRecovery = handleRecovery;
    
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
                const x = (mouseX - 0.5) * speed * 30;
                const y = (mouseY - 0.5) * speed * 30;
                
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
    enhanceFloatingLabels();
    animateCardEntrance();
    initParallaxEffect();
    preventIOSZoom();
    
    console.log('✅ [INIT] Página de recuperação totalmente carregada!');
}); 