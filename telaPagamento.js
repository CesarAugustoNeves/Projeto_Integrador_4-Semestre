// telaPagamento.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    const backBtn = document.getElementById('backBtn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const orderTotalElement = document.getElementById('orderTotal');
    
    // URLs da API
    const API_BASE = 'http://localhost:8081/api';
    const SALES_URL = `${API_BASE}/vendas`;
    const PRODUTOS_URL = `${API_BASE}/produtos`;
    
    // Dados do pedido (em uma implementação real, isso viria da página anterior)
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    let orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 80.10;

    // Inicialização
    initPaymentMethods();
    loadOrderFromCart();
    setupEventListeners();

    // Inicializar métodos de pagamento
    function initPaymentMethods() {
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover classe 'selected' de todas as opções
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Adicionar classe 'selected' à opção clicada
                option.classList.add('selected');
                
                // Ocultar todos os formulários
                paymentForms.forEach(form => form.classList.remove('active'));
                
                // Mostrar o formulário correspondente
                const method = option.getAttribute('data-method');
                document.getElementById(`${method}-form`).classList.add('active');
            });
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Botão Voltar
        backBtn.addEventListener('click', () => {
            window.history.back();
        });

        // Botão Confirmar Pagamento
        confirmPaymentBtn.addEventListener('click', async () => {
            await processPayment();
        });

        // Formatação automática dos campos
        document.getElementById('creditNumber')?.addEventListener('input', formatCardNumber);
        document.getElementById('debitNumber')?.addEventListener('input', formatCardNumber);
        document.getElementById('creditExpiry')?.addEventListener('input', formatExpiryDate);
        document.getElementById('debitExpiry')?.addEventListener('input', formatExpiryDate);
    }

    // Carregar dados do carrinho
    function loadOrderFromCart() {
        if (cart.length > 0) {
            // Atualizar total se houver carrinho
            orderTotalElement.textContent = orderTotal.toFixed(2);
            
            // Você pode atualizar dinamicamente os itens do pedido aqui
            // usando os dados do carrinho
        }
    }

    // Processar pagamento
    async function processPayment() {
        const selectedMethod = document.querySelector('.payment-option.selected').getAttribute('data-method');
        
        // Validar formulário baseado no método selecionado
        if (!validatePaymentForm(selectedMethod)) {
            return;
        }

        try {
            // Criar objeto de venda
            const saleData = {
                dataVenda: new Date().toISOString(),
                valorTotal: orderTotal,
                formaPagamento: selectedMethod,
                status: 'CONCLUIDO',
                itens: cart.map(item => ({
                    produtoId: item.id || 0,
                    quantidade: item.quantity || 1,
                    precoUnitario: item.price || 0
                }))
            };

            // Enviar para API
            const response = await fetch(SALES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saleData)
            });

            if (response.ok) {
                const saleResult = await response.json();
                
                // Atualizar estoque para cada item
                await updateStockForItems(cart);
                
                // Limpar carrinho
                localStorage.removeItem('shoppingCart');
                localStorage.removeItem('orderTotal');
                
                // Mostrar confirmação
                showPaymentSuccess(saleResult.id);
                
                // Redirecionar após 3 segundos
                setTimeout(() => {
                    window.location.href = 'escanearProduto.html';
                }, 3000);
                
            } else {
                throw new Error('Erro ao processar pagamento');
            }
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        }
    }

    // Atualizar estoque dos produtos
    async function updateStockForItems(cartItems) {
        for (const item of cartItems) {
            if (item.id) {
                try {
                    // Primeiro busca o produto atual
                    const response = await fetch(`${PRODUTOS_URL}/${item.id}`);
                    if (response.ok) {
                        const produto = await response.json();
                        const novoEstoque = produto.estoque - (item.quantity || 1);
                        
                        // Atualiza o estoque
                        await fetch(`${PRODUTOS_URL}/${item.id}/estoque`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ estoque: novoEstoque })
                        });
                    }
                } catch (error) {
                    console.error(`Erro ao atualizar estoque do produto ${item.id}:`, error);
                }
            }
        }
    }

    // Validar formulário de pagamento
    function validatePaymentForm(method) {
        switch(method) {
            case 'credit':
                return validateCreditCardForm();
            case 'debit':
                return validateDebitCardForm();
            case 'pix':
                return true; // PIX não precisa de validação de formulário
            default:
                return false;
        }
    }

    // Validar formulário de cartão de crédito
    function validateCreditCardForm() {
        const cardNumber = document.getElementById('creditNumber').value.replace(/\s/g, '');
        const cardName = document.getElementById('creditName').value.trim();
        const expiry = document.getElementById('creditExpiry').value;
        const cvv = document.getElementById('creditCVV').value;
        
        if (!cardNumber || cardNumber.length !== 16) {
            alert('Número do cartão inválido. Deve ter 16 dígitos.');
            return false;
        }
        
        if (!cardName) {
            alert('Por favor, informe o nome no cartão.');
            return false;
        }
        
        if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
            alert('Data de validade inválida. Use o formato MM/AA.');
            return false;
        }
        
        if (!cvv || cvv.length !== 3) {
            alert('CVV inválido. Deve ter 3 dígitos.');
            return false;
        }
        
        return true;
    }

    // Validar formulário de cartão de débito
    function validateDebitCardForm() {
        const cardNumber = document.getElementById('debitNumber').value.replace(/\s/g, '');
        const cardName = document.getElementById('debitName').value.trim();
        const expiry = document.getElementById('debitExpiry').value;
        const cvv = document.getElementById('debitCVV').value;
        const password = document.getElementById('debitPassword').value;
        
        if (!cardNumber || cardNumber.length !== 16) {
            alert('Número do cartão inválido. Deve ter 16 dígitos.');
            return false;
        }
        
        if (!cardName) {
            alert('Por favor, informe o nome no cartão.');
            return false;
        }
        
        if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
            alert('Data de validade inválida. Use o formato MM/AA.');
            return false;
        }
        
        if (!cvv || cvv.length !== 3) {
            alert('CVV inválido. Deve ter 3 dígitos.');
            return false;
        }
        
        if (!password || password.length !== 6) {
            alert('Senha inválida. Deve ter 6 dígitos.');
            return false;
        }
        
        return true;
    }

    // Mostrar confirmação de pagamento
    function showPaymentSuccess(orderId) {
        // Criar modal de confirmação
        const modal = document.createElement('div');
        modal.className = 'payment-success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Pagamento Confirmado!</h2>
                <p>Seu pagamento foi processado com sucesso.</p>
                <p><strong>Nº do Pedido: #${orderId}</strong></p>
                <p>Total: R$ ${orderTotal.toFixed(2)}</p>
                <p>Você será redirecionado em instantes...</p>
            </div>
        `;
        
        // Estilos para o modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.querySelector('.modal-content').style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        
        document.querySelector('.modal-icon i').style.cssText = `
            font-size: 60px;
            color: #27ae60;
            margin-bottom: 20px;
        `;
        
        document.body.appendChild(modal);
    }

    // Funções auxiliares de formatação
    function formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19);
    }

    function formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value.substring(0, 5);
    }

    // Salvar dados do carrinho (para ser usado da página de escaneamento)
    window.saveCartData = function(cartItems, total) {
        localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
        localStorage.setItem('orderTotal', total.toString());
    };
});
