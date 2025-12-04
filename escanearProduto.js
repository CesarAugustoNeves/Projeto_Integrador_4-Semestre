/*--DIA 13/10|NOME:Vitor Eugênio Castelano Silva|HORA INICIO: 14:00 HORA FINAL DO DIA:16:40 --*/
/*--INTEGRAÇÃO BACKEND: Atualizado para consumir API Spring Boot --*/

document.addEventListener('DOMContentLoaded', function() {
    // DEBUG - Verificar se o script está carregando
    console.log('=== ESCANEARPRODUTO.JS (INTEGRADO) CARREGADO ===');
    console.log('URL atual:', window.location.href);

    // ============================================
    // CONFIGURAÇÕES DA API
    // ============================================
    const API_BASE_URL = 'http://localhost:8081/api/produtos';

    // Cache local de produtos para evitar requisições repetidas e manter compatibilidade
    // Inicialmente vazio, será preenchido conforme produtos são buscados no banco
    const productsDatabase = {};

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
        
        if (!savedOrder) {
            return;
        }
        
        try {
            const orderData = JSON.parse(savedOrder);
            
            // Restaurar o carrinho
            if (orderData.cart && Array.isArray(orderData.cart)) {
                cart = orderData.cart;
                
                // IMPORTANTE: Repopular o cache (productsDatabase) com os itens do carrinho
                // Isso garante que o nome e preço estejam disponíveis para exibição sem nova consulta
                cart.forEach(item => {
                    productsDatabase[item.code] = {
                        name: item.name,
                        price: item.price
                    };
                });
            }
            
            // Restaurar histórico
            if (orderData.scanHistory && Array.isArray(orderData.scanHistory)) {
                scanHistory = orderData.scanHistory;
            }
            
        } catch (error) {
            console.error('ERRO CRÍTICO ao carregar do localStorage:', error);
        }
    }
    
    function saveCartToStorage() {
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
        
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
    }

    // ============================================
    // FUNÇÕES PRINCIPAIS (MODIFICADAS PARA API)
    // ============================================

    // Buscar produto na API e adicionar ao carrinho
    async function addProductToCart(productCode) {
        // 1. Verifica se já temos o produto no cache local (evita requisição)
        if (productsDatabase[productCode]) {
            processAddProduct(productCode, productsDatabase[productCode]);
            return;
        }

        // 2. Se não está no cache, busca no Backend
        try {
            // Mostra feedback visual de carregamento (opcional)
            productCodeInput.disabled = true;
            document.body.style.cursor = 'wait';

            const response = await fetch(`${API_BASE_URL}/codigo/${productCode}`);

            if (response.ok) {
                const produtoBackend = await response.json();
                
                // Mapeia os dados do Java (nome, preco) para o formato do JS (name, price)
                const productData = {
                    name: produtoBackend.nome,
                    price: produtoBackend.preco
                };

                // Salva no cache local
                productsDatabase[productCode] = productData;

                // Processa a adição
                processAddProduct(productCode, productData);
            } else if (response.status === 404) {
                alert('Produto não encontrado no sistema.');
            } else {
                throw new Error(`Erro do servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            alert('Erro ao conectar ao servidor. Verifique se o backend está rodando.');
        } finally {
            // Restaura estado da interface
            productCodeInput.disabled = false;
            document.body.style.cursor = 'default';
            productCodeInput.focus();
        }
    }

    // Função interna para lógica de adição (separada do fetch)
    function processAddProduct(productCode, product) {
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
            
            // Reatribuir event listeners
            attachCartEventListeners();
        }
        
        // Atualizar total
        updateTotal();
    }

    function attachCartEventListeners() {
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

    // Atualizar histórico de escaneamentos
    function updateScanHistory() {
        scanHistoryContainer.innerHTML = '';
        
        scanHistory.forEach(code => {
            // Só exibe se estiver no cache (já buscado anteriormente)
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

    // Aumentar quantidade
    function increaseQuantity(productCode) {
        const itemIndex = cart.findIndex(item => item.code === productCode);
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += 1;
            updateCartDisplay();
            saveCartToStorage();
        }
    }

    // Diminuir quantidade
    function decreaseQuantity(productCode) {
        const itemIndex = cart.findIndex(item => item.code === productCode);
        if (itemIndex !== -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                removeFromCart(productCode);
                return;
            }
            updateCartDisplay();
            saveCartToStorage();
        }
    }

    // Remover item
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
    // FUNÇÃO PARA ADICIONAR BOTÃO DE ADMINISTRADOR
    // ============================================
    function checkAdminAccess() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isAdmin && adminLoggedIn) {
            const existingAdminBtn = document.querySelector('.admin-access-btn');
            if (existingAdminBtn) return;
            
            const adminAccessBtn = document.createElement('button');
            adminAccessBtn.className = 'admin-access-btn';
            adminAccessBtn.innerHTML = '<i class="fas fa-user-shield"></i> Área Gerencial';
            adminAccessBtn.style.marginTop = '10px';
            adminAccessBtn.addEventListener('click', () => {
                window.location.href = 'Gerente.html';
            });
            
            const actionButtons = document.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.appendChild(adminAccessBtn);
            }
        }
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
        alert('A câmera requer HTTPS ou localhost seguro. Para testes, use a entrada manual.');
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
            return;
        }
        
        saveCartToStorage();
        window.location.href = 'telaPagamento.html';
    });

    logoutBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja sair do sistema?\nSeu carrinho será limpo.')) {
            localStorage.removeItem('currentOrder');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminLoggedIn');
            
            cart = [];
            scanHistory = [];
            
            updateCartDisplay();
            updateScanHistory();
            
            window.location.href = 'telaLogin.html';
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

    loadCartFromStorage();
    updateCartDisplay();
    updateScanHistory();
    checkAdminAccess();
});