/*--DIA [03/12/2025]|NOME:[Alex Torres]|HORA INICIO: [14:00] HORA FINAL DO DIA:[22:00] --*/

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de pagamento carregada');
    
    // ============================================
    // ELEMENTOS DOM
    // ============================================
    const orderItemsContainer = document.querySelector('.order-items');
    const orderTotalElement = document.getElementById('orderTotal');
    const orderInfoElement = document.querySelector('.order-info');
    const pixAmountElement = document.getElementById('pixAmount');
    
    // Elementos dos métodos de pagamento
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    const backBtn = document.getElementById('backBtn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    
    // ============================================
    // CARREGAR DADOS DO PEDIDO
    // ============================================
    
    loadOrderData();
    
    function loadOrderData() {
        console.log('Carregando dados do pedido...');
        
        // 1. Tentar pegar os dados do localStorage
        const savedOrder = localStorage.getItem('currentOrder');
        
        // 2. Verificar se existem dados
        if (!savedOrder) {
            console.warn('Nenhum pedido encontrado no localStorage');
            showEmptyOrderMessage();
            return;
        }
        
        try {
            // 3. Converter de volta para objeto JavaScript
            const orderData = JSON.parse(savedOrder);
            console.log('Pedido carregado:', orderData);
            
            // 4. Verificar se o carrinho tem itens
            if (!orderData.cart || orderData.cart.length === 0) {
                showEmptyOrderMessage();
                return;
            }
            
            // 5. Exibir os itens do pedido
            displayOrderItems(orderData.cart);
            
            // 6. Atualizar o total
            updateOrderTotal(orderData.total);
            
            // 7. Atualizar informações do pedido
            updateOrderInfo(orderData);
            
            // 8. Atualizar valor do PIX
            if (pixAmountElement) {
                pixAmountElement.textContent = orderData.total.toFixed(2).replace('.', ',');
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados do pedido:', error);
            showEmptyOrderMessage();
        }
    }
    
    function displayOrderItems(cartItems) {
        // Limpar o container (remover os dados estáticos)
        orderItemsContainer.innerHTML = '';
        
        // Verificar se há itens
        if (!cartItems || cartItems.length === 0) {
            showEmptyOrderMessage();
            return;
        }
        
        // Para cada item no carrinho, criar um elemento HTML
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            
            itemElement.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity-price">
                        <span>${item.quantity} ${item.quantity > 1 ? 'unidades' : 'unidade'}</span>
                        <span>R$ ${item.price.toFixed(2).replace('.', ',')} cada</span>
                    </div>
                </div>
            `;
            
            orderItemsContainer.appendChild(itemElement);
        });
    }
    
    function updateOrderTotal(total) {
        // Formatar o número para exibir com vírgula
        orderTotalElement.textContent = total.toFixed(2).replace('.', ',');
    }
    
    function updateOrderInfo(orderData) {
        // Usar a data do pedido ou criar uma nova
        const orderDate = orderData.date || new Date().toLocaleString('pt-BR');
        const orderId = orderData.orderId || '#123456';
        
        orderInfoElement.innerHTML = `
            <p><i class="fas fa-store"></i> <strong>Mercado Autônomo</strong></p>
            <p><i class="fas fa-clock"></i> Data: ${orderDate}</p>
            <p><i class="fas fa-barcode"></i> Nº do Pedido: ${orderId}</p>
        `;
    }
    
    function showEmptyOrderMessage() {
        orderItemsContainer.innerHTML = `
            <div class="empty-order">
                <i class="fas fa-shopping-cart"></i>
                <p>Nenhum pedido encontrado</p>
                <p>Volte ao carrinho para adicionar produtos</p>
            </div>
        `;
        orderTotalElement.textContent = '0,00';
        
        if (pixAmountElement) {
            pixAmountElement.textContent = '0,00';
        }
    }
    
    // ============================================
    // GERENCIAMENTO DE MÉTODOS DE PAGAMENTO
    // ============================================
    
    console.log('Configurando métodos de pagamento...');
    
    // Inicializar o gerenciamento de pagamento
    initPaymentMethods();
    
    function initPaymentMethods() {
        console.log('Inicializando métodos de pagamento...');
        
        // 1. Adicionar event listener a cada opção de pagamento
        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectPaymentMethod(this);
            });
        });
        
        // 2. Configurar botão "Voltar ao Carrinho"
        if (backBtn) {
            backBtn.addEventListener('click', goBackToCart);
        }
        
        // 3. Configurar botão "Confirmar Pagamento"
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', processPayment);
        }
        
        console.log(`${paymentOptions.length} métodos de pagamento configurados`);
    }
    
    function selectPaymentMethod(selectedOption) {
        // 1. Remover a classe 'selected' de todas as opções
        paymentOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // 2. Adicionar a classe 'selected' à opção clicada
        selectedOption.classList.add('selected');
        
        // 3. Obter o método selecionado (pix, credit, debit)
        const selectedMethod = selectedOption.getAttribute('data-method');
        
        // 4. Esconder todos os formulários
        paymentForms.forEach(form => {
            form.classList.remove('active');
        });
        
        // 5. Mostrar apenas o formulário correspondente
        const activeForm = document.getElementById(`${selectedMethod}-form`);
        if (activeForm) {
            activeForm.classList.add('active');
            console.log(`Método selecionado: ${getPaymentMethodName(selectedMethod)}`);
        }
    }
    
    function goBackToCart() {
        console.log('Voltando ao carrinho...');
        
        // Perguntar se o usuário tem certeza
        if (confirm('Deseja voltar ao carrinho?\nOs itens do seu pedido serão mantidos.')) {
            // Redirecionar com parâmetro para identificar que estamos voltando
            window.location.href = 'escanearProduto.html?returning=true';
        }
    }
    
    function processPayment() {
        // 1. Obter o método de pagamento selecionado
        const selectedOption = document.querySelector('.payment-option.selected');
        if (!selectedOption) {
            alert('Por favor, selecione um método de pagamento.');
            return;
        }
        
        const selectedMethod = selectedOption.getAttribute('data-method');
        const methodName = getPaymentMethodName(selectedMethod);
        const orderTotal = document.getElementById('orderTotal').textContent;
        const orderId = document.querySelector('.order-info p:nth-child(3)').textContent.replace('Nº do Pedido: ', '');
        
        console.log(`Iniciando processamento do pagamento via ${methodName}...`);
        
        // 2. Mostrar mensagem de acordo com o método selecionado
        let instructions = '';
        let confirmMessage = '';
        
        switch(selectedMethod) {
            case 'pix':
                instructions = `🔹 Abra o aplicativo do seu banco\n` +
                              `🔹 Selecione "Pagar com PIX"\n` +
                              `🔹 Aponte a câmera para o QR Code\n` +
                              `🔹 Confirme o pagamento no celular`;
                confirmMessage = `Deseja prosseguir com o pagamento PIX?`;
                break;
                
            case 'credit':
                instructions = `🔹 Insira ou aproxime seu cartão na maquininha\n` +
                              `🔹 Digite sua senha no leitor\n` +
                              `🔹 Selecione o número de parcelas\n` +
                              `🔹 Aguarde a confirmação`;
                confirmMessage = `Deseja prosseguir com o pagamento via Cartão de Crédito?`;
                break;
                
            case 'debit':
                instructions = `🔹 Insira ou aproxime seu cartão na maquininha\n` +
                              `🔹 Digite sua senha no leitor\n` +
                              `🔹 Confirme o valor e a transação\n` +
                              `🔹 Aguarde a confirmação`;
                confirmMessage = `Deseja prosseguir com o pagamento via Cartão de Débito?`;
                break;
        }
        
        // 3. Mostrar diálogo de confirmação
        const fullMessage = `💳 PAGAMENTO\n\n` +
                          `Método: ${methodName}\n` +
                          `Valor: R$ ${orderTotal}\n` +
                          `Pedido: ${orderId}\n\n` +
                          `${instructions}\n\n` +
                          `${confirmMessage}`;
        
        if (confirm(fullMessage)) {
            // 4. Simular processamento
            simulatePaymentProcessing(selectedMethod, methodName, orderTotal, orderId);
        }
    }
    
    function simulatePaymentProcessing(method, methodName, orderTotal, orderId) {
        console.log(`Simulando processamento do pagamento via ${methodName}...`);
        
        // 1. Mostrar mensagem de processamento
        alert(`⏳ PROCESSANDO PAGAMENTO\n\n` +
              `Método: ${methodName}\n` +
              `Valor: R$ ${orderTotal}\n` +
              `Pedido: ${orderId}\n\n` +
              `Aguarde a confirmação...`);
        
        // 2. Simular delay de processamento (2-4 segundos)
        const processingTime = 2000 + Math.random() * 2000; // Entre 2 e 4 segundos
        
        setTimeout(() => {
            // 3. Simular resultado (85% sucesso, 15% erro)
            const isSuccess = Math.random() < 0.85;
            
            if (isSuccess) {
                // Pagamento bem-sucedido
                showPaymentSuccess(methodName, orderTotal, orderId);
            } else {
                // Pagamento recusado
                showPaymentError(methodName, orderTotal);
            }
        }, processingTime);
    }
    
    function showPaymentSuccess(methodName, orderTotal, orderId) {
        console.log('Pagamento simulado com sucesso!');
        
        // Criar mensagem de sucesso
        let successMessage = `✅ PAGAMENTO CONFIRMADO!\n\n` +
                           `Método: ${methodName}\n` +
                           `Valor: R$ ${orderTotal}\n` +
                           `Pedido: ${orderId}\n\n` +
                           `Obrigado pela sua compra!\n\n`;
        
        // Adicionar instruções específicas
        if (methodName === 'PIX') {
            successMessage += `📱 O comprovante foi enviado para o seu aplicativo bancário.`;
        } else {
            successMessage += `💳 O comprovante será impresso pela maquininha.`;
        }
        
        // Mostrar mensagem
        alert(successMessage);
        
        // 1. Limpar o carrinho do localStorage
        localStorage.removeItem('currentOrder');
        
        // 2. Desabilitar botões para evitar duplo clique
        if (backBtn) backBtn.disabled = true;
        if (confirmPaymentBtn) confirmPaymentBtn.disabled = true;
        
        // 3. Mudar texto do botão de confirmação
        if (confirmPaymentBtn) {
            confirmPaymentBtn.innerHTML = '<i class="fas fa-check"></i> Pagamento Confirmado';
            confirmPaymentBtn.style.backgroundColor = '#95a5a6';
        }
        
        // 4. Redirecionar para tela inicial após 3 segundos
        setTimeout(() => {
            alert('🛒 Redirecionando para a tela inicial...');
            window.location.href = 'telaLogin.html';
        }, 3000);
    }
    
    function showPaymentError(methodName, orderTotal) {
        console.log('Pagamento simulado com erro!');
        
        // Criar mensagem de erro
        let errorMessage = `❌ PAGAMENTO NÃO AUTORIZADO\n\n` +
                         `Método: ${methodName}\n` +
                         `Valor: R$ ${orderTotal}\n\n` +
                         `Motivo: Transação não autorizada\n\n`;
        
        // Adicionar sugestões baseadas no método
        switch(methodName) {
            case 'PIX':
                errorMessage += `Sugestões:\n` +
                              `🔸 Verifique o saldo da sua conta\n` +
                              `🔸 Tente novamente em alguns instantes\n` +
                              `🔸 Entre em contato com seu banco`;
                break;
                
            case 'Cartão de Crédito':
            case 'Cartão de Débito':
                errorMessage += `Sugestões:\n` +
                              `🔸 Verifique os dados do cartão\n` +
                              `🔸 Confirme o limite/saldo disponível\n` +
                              `🔸 Tente outro cartão ou método de pagamento\n` +
                              `🔸 Entre em contato com a operadora do cartão`;
                break;
        }
        
        // Mostrar mensagem
        alert(errorMessage);
        
        // Oferecer opção de tentar novamente
        if (confirm('Deseja tentar o pagamento novamente?')) {
            // Simular novo processamento após 1 segundo
            setTimeout(() => {
                simulatePaymentProcessing(
                    getPaymentMethodKey(methodName),
                    methodName,
                    orderTotal,
                    document.querySelector('.order-info p:nth-child(3)').textContent.replace('Nº do Pedido: ', '')
                );
            }, 1000);
        }
    }
    
    function getPaymentMethodName(methodKey) {
        switch(methodKey) {
            case 'pix': return 'PIX';
            case 'credit': return 'Cartão de Crédito';
            case 'debit': return 'Cartão de Débito';
            default: return 'Método Desconhecido';
        }
    }
    
    function getPaymentMethodKey(methodName) {
        switch(methodName) {
            case 'PIX': return 'pix';
            case 'Cartão de Crédito': return 'credit';
            case 'Cartão de Débito': return 'debit';
            default: return 'pix';
        }
    }
    
    // ============================================
    // INICIALIZAÇÃO FINAL
    // ============================================
    
    console.log('Tela de pagamento inicializada com sucesso!');
    
    // Verificar se há dados no localStorage (para depuração)
    console.log('Dados no localStorage:', localStorage.getItem('currentOrder'));
    
    // Adicionar estilo para botões desabilitados
    const style = document.createElement('style');
    style.textContent = `
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        button:disabled:hover {
            background-color: inherit;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
});