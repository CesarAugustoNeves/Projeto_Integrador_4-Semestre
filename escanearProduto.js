/*--DIA 13/10|NOME:Vitor Eugênio Castelano Silva|HORA INICIO: 14:00 HORA FINAL DO DIA:16:40 --*/         
        // Simulação de banco de dados de produtos
        // DEBUG - Verificar se o script está carregando
        console.log('=== ESCANEARPRODUTO.JS CARREGADO ===');
        console.log('URL atual:', window.location.href);
        console.log('localStorage atual:', localStorage.getItem('currentOrder'));

        const productsDatabase = {
            '123456': { name: 'Arroz 5kg', price: 25.90 },
            '789012': { name: 'Feijão 1kg', price: 8.50 },
            '345678': { name: 'Óleo de Soja 900ml', price: 7.80 },
            '901234': { name: 'Açúcar 1kg', price: 4.20 },
            '567890': { name: 'Café 500g', price: 12.90 },
            '234567': { name: 'Leite 1L', price: 4.50 },
            '890123': { name: 'Pão de Forma', price: 8.00 },
            '456789': { name: 'Manteiga 200g', price: 9.80 },
            '012345': { name: 'Queijo Mussarela 500g', price: 22.50 },
            '678901': { name: 'Presunto 300g', price: 15.90 }
        };

        // Carrinho de compras
        let cart = [];
        let scanHistory = [];

        // Elementos DOM
        const productCodeInput = document.getElementById('productCode');
        const addProductBtn = document.getElementById('addProductBtn');
        const startCameraBtn = document.getElementById('startCameraBtn');
        const cartItemsContainer = document.getElementById('cartItems');
        const totalAmountElement = document.getElementById('totalAmount');
        const scanHistoryContainer = document.getElementById('scanHistory');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // ============================================
        // FUNÇÃO PARA CARREGAR CARRINHO DO LOCALSTORAGE
        // ============================================
        function loadCartFromStorage() {
            console.log('=== LOADCARTFROMSTORAGE INICIANDO ===');
            const savedOrder = localStorage.getItem('currentOrder');
            console.log('Valor bruto do localStorage:', savedOrder);
            
            if (!savedOrder) {
                console.log('AVISO: Nenhum dado encontrado no localStorage');
                console.log('Cart será mantido como:', cart);
                return;
            }
            
            try {
                const orderData = JSON.parse(savedOrder);
                console.log('Dados parseados:', orderData);
                
                // Verificar estrutura dos dados
                if (!orderData || typeof orderData !== 'object') {
                    console.error('Erro: orderData não é um objeto válido');
                    return;
                }
                
                // Restaurar o carrinho
                if (orderData.cart && Array.isArray(orderData.cart)) {
                    console.log('Cart antes de restaurar:', cart);
                    cart = orderData.cart;
                    console.log('Cart depois de restaurar:', cart);
                } else {
                    console.warn('AVISO: orderData.cart não encontrado ou não é array');
                }
                
                // Restaurar histórico
                if (orderData.scanHistory && Array.isArray(orderData.scanHistory)) {
                    scanHistory = orderData.scanHistory;
                    console.log('Histórico restaurado:', scanHistory);
                }
                
            } catch (error) {
                console.error('ERRO CRÍTICO ao carregar do localStorage:', error);
                console.error('String problemática:', savedOrder);
            }
        }
        function saveCartToStorage() {
            console.log('=== SAVECARTTOSTORAGE CHAMADA ===');
            
            // Calcular o total do carrinho
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Criar objeto com dados do pedido
            const orderData = {
                cart: cart,
                scanHistory: scanHistory,
                total: total,
                orderId: '#' + Date.now(),
                date: new Date().toLocaleString('pt-BR')
            };
            
            console.log('Salvando no localStorage:', orderData);
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            console.log('localStorage atualizado com sucesso');
        }

        // ============================================
        // FUNÇÕES PRINCIPAIS
        // ============================================

        // Adicionar produto ao carrinho
        function addProductToCart(productCode) {
            if (!productsDatabase[productCode]) {
                alert('Produto não encontrado. Verifique o código e tente novamente.');
                return;
            }

            const product = productsDatabase[productCode];
            
            // Verificar se o produto já está no carrinho
            const existingItemIndex = cart.findIndex(item => item.code === productCode);
            
            if (existingItemIndex !== -1) {
                // Produto já está no carrinho, aumentar quantidade
                cart[existingItemIndex].quantity += 1;
            } else {
                // Adicionar novo produto ao carrinho
                cart.push({
                    code: productCode,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            
            // Adicionar ao histórico de escaneamentos (se não estiver lá)
            if (!scanHistory.includes(productCode)) {
                scanHistory.push(productCode);
                updateScanHistory();
            }
            
            updateCartDisplay();
            productCodeInput.value = ''; // Limpar campo de entrada
            productCodeInput.focus(); // Focar no campo de entrada

            saveCartToStorage();
        }

        // Atualizar exibição do carrinho
        function updateCartDisplay() {
            // Limpar carrinho
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-basket"></i>
                        <p>Seu carrinho está vazio</p>
                        <p>Escaneie produtos para adicioná-los ao carrinho</p>
                    </div>
                `;
            } else {
                cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">R$ ${item.price.toFixed(2)}</div>
                        </div>
                        <div class="item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" data-code="${item.code}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-code="${item.code}">+</button>
                            </div>
                            <button class="remove-btn" data-code="${item.code}"><i class="fas fa-trash"></i> Remover</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                });
                
                // Adicionar event listeners aos botões de quantidade e remoção
                document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const code = e.target.getAttribute('data-code');
                        decreaseQuantity(code);
                    });
                });
                
                document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const code = e.target.getAttribute('data-code');
                        increaseQuantity(code);
                    });
                });
                
                document.querySelectorAll('.remove-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const code = e.target.getAttribute('data-code');
                        removeFromCart(code);
                    });
                });
            }
            
            // Atualizar total
            updateTotal();
        }

        // Atualizar histórico de escaneamentos
        function updateScanHistory() {
            scanHistoryContainer.innerHTML = '';
            
            scanHistory.forEach(code => {
                if (productsDatabase[code]) {
                    const scanItem = document.createElement('div');
                    scanItem.className = 'scan-item';
                    scanItem.innerHTML = `<i class="fas fa-barcode"></i> ${productsDatabase[code].name}`;
                    scanItem.addEventListener('click', () => {
                        addProductToCart(code);
                    });
                    scanHistoryContainer.appendChild(scanItem);
                }
            });
        }

        // Atualizar total do carrinho
        function updateTotal() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalAmountElement.textContent = total.toFixed(2);
        }

        // Aumentar quantidade de um item
        function increaseQuantity(productCode) {
            const itemIndex = cart.findIndex(item => item.code === productCode);
            if (itemIndex !== -1) {
                cart[itemIndex].quantity += 1;
                updateCartDisplay();
            }
        }

        // Diminuir quantidade de um item
        function decreaseQuantity(productCode) {
            const itemIndex = cart.findIndex(item => item.code === productCode);
            if (itemIndex !== -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    // Se a quantidade for 1, remover o item
                    removeFromCart(productCode);
                    return;
                }
                updateCartDisplay();
            }
            saveCartToStorage();
        }

        // Remover item do carrinho
        function removeFromCart(productCode) {
            cart = cart.filter(item => item.code !== productCode);
            updateCartDisplay();
            saveCartToStorage();
        }

        // Limpar histórico
        function clearHistory() {
            scanHistory = [];
            updateScanHistory();
            saveCartToStorage();
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================

        addProductBtn.addEventListener('click', () => {
            const productCode = productCodeInput.value.trim();
            if (productCode) {
                addProductToCart(productCode);
            } else {
                alert('Por favor, digite um código de produto.');
            }
        });

        productCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const productCode = productCodeInput.value.trim();
                if (productCode) {
                    addProductToCart(productCode);
                }
            }
        });

        startCameraBtn.addEventListener('click', () => {
            alert('Funcionalidade de câmera será implementada posteriormente. Por enquanto, use a entrada manual.');
        });

        checkoutBtn.addEventListener('click', () => {
            console.log('=== CHECKOUT CLICADO ===');
            console.log('Cart atual:', cart);
            
            if (cart.length === 0) {
                alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
                return;
            }
            
            // Usar a nova função para salvar
            saveCartToStorage();
            
            // Pequeno delay para garantir que o localStorage foi salvo
            setTimeout(() => {
                console.log('Redirecionando para pagamento...');
                window.location.href = 'telaPagamento.html';
            }, 100);


            // Calcular o total do carrinho
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Criar objeto com dados do pedido
            const orderData = {
                cart: cart, // Todos os itens do carrinho
                scanHistory: scanHistory, // Salva o histórico também
                total: total, // Valor total
                orderId: '#' + Date.now(), // ID único baseado no timestamp
                date: new Date().toLocaleString('pt-BR') // Data atual
            };
            
            // Salvar no localStorage
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            
            // Redirecionar para a tela de pagamento
            window.location.href = 'telaPagamento.html';
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                // Redirecionar para a tela de login
                alert('Saindo do sistema...');
                // Em uma implementação real, aqui você redirecionaria para a página de login
                // window.location.href = 'telaLogin.html';
            }
        });

        clearHistoryBtn.addEventListener('click', () => {
            if (scanHistory.length > 0) {
                if (confirm('Tem certeza que deseja limpar o histórico de escaneamentos?')) {
                    clearHistory();
                }
            } else {
                alert('O histórico de escaneamentos já está vazio.');
            }
        });

        // ============================================
        // INICIALIZAÇÃO
        // ============================================

        console.log('=== INICIALIZANDO TELA DE ESCANEAMENTO ===');

        // Verificar se estamos voltando da tela de pagamento
        const urlParams = new URLSearchParams(window.location.search);
        const returningFromPayment = urlParams.get('returning');

        if (returningFromPayment) {
            console.log('Retornando da tela de pagamento');
        }

        // Carregar dados do localStorage ao iniciar
        console.log('Chamando loadCartFromStorage...');
        loadCartFromStorage();

        // Inicializar a tela
        console.log('Chamando updateCartDisplay...');
        updateCartDisplay();

        console.log('Chamando updateScanHistory...');
        updateScanHistory();

        console.log('=== INICIALIZAÇÃO COMPLETA ===');
        console.log('Cart final:', cart);
        console.log('localStorage final:', localStorage.getItem('currentOrder'));