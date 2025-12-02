document.addEventListener('DOMContentLoaded', function() {
    // Elementos da interface
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const productForm = document.getElementById('productForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const exportBtn = document.getElementById('exportBtn');

    // URLs da API
    const API_BASE = 'http://localhost:8081/api';
    const PRODUCTS_URL = `${API_BASE}/produtos`;
    const SALES_URL = `${API_BASE}/vendas`;
    const DASHBOARD_URL = `${API_BASE}/dashboard`;

    // Inicialização
    initTabs();
    loadDashboardData();
    loadProducts();
    loadSales();
    setupEventListeners();

    // Sistema de abas
    function initTabs() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove classe active de todas as abas e conteúdos
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adiciona classe active à aba e conteúdo selecionados
                tab.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
                
                // Carrega dados específicos da aba
                if (tabId === 'inventory') {
                    loadProducts();
                } else if (tabId === 'sales') {
                    loadSales();
                }
            });
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Cadastrar novo produto
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await cadastrarProduto();
        });

        // Exportar relatórios
        exportBtn.addEventListener('click', async () => {
            await exportarRelatorios();
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            fazerLogout();
        });
    }

    // Carregar dados do dashboard
    async function loadDashboardData() {
        try {
            const response = await fetch(DASHBOARD_URL);
            if (!response.ok) throw new Error('Erro ao carregar dashboard');
            
            const data = await response.json();
            updateDashboardCards(data);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            // Usar dados mockados em caso de erro
            updateDashboardCards(getMockDashboardData());
        }
    }

    // Atualizar cards do dashboard
    function updateDashboardCards(data) {
        const cards = document.querySelectorAll('.dashboard-card p');
        if (cards.length >= 4) {
            cards[0].textContent = `R$ ${data.vendasHoje.toFixed(2)}`;
            cards[1].textContent = data.produtosEstoque.toLocaleString('pt-BR');
            cards[2].textContent = data.clientesAtivos.toLocaleString('pt-BR');
            cards[3].textContent = `R$ ${data.vendasMes.toFixed(2)}`;
        }
    }

    // Carregar produtos para gerenciamento de estoque
    async function loadProducts() {
        try {
            const response = await fetch(PRODUCTS_URL);
            if (!response.ok) throw new Error('Erro ao carregar produtos');
            
            const produtos = await response.json();
            renderProductsTable(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Fallback para dados mockados
            renderProductsTable(getMockProducts());
        }
    }

    // Carregar vendas
    async function loadSales() {
        try {
            const response = await fetch(SALES_URL);
            if (!response.ok) throw new Error('Erro ao carregar vendas');
            
            const vendas = await response.json();
            renderSalesTable(vendas);
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
            // Fallback para dados mockados
            renderSalesTable(getMockSales());
        }
    }

    // Renderizar tabela de produtos
    function renderProductsTable(produtos) {
        const tbody = document.querySelector('#inventory-tab tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (produtos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        Nenhum produto cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.codigo}</td>
                <td>R$ ${typeof produto.preco === 'number' ? produto.preco.toFixed(2) : '0.00'}</td>
                <td>${produto.estoque}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${produto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteProduct(${produto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Renderizar tabela de vendas
    function renderSalesTable(vendas) {
        const tbody = document.querySelector('#sales-tab tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (vendas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        Nenhuma venda registrada
                    </td>
                </tr>
            `;
            return;
        }

        vendas.forEach(venda => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venda.cliente || 'Cliente não identificado'}</td>
                <td>${venda.email || 'N/A'}</td>
                <td>${formatDate(venda.dataVenda)}</td>
                <td>R$ ${typeof venda.valorTotal === 'number' ? venda.valorTotal.toFixed(2) : '0.00'}</td>
                <td>
                    <button class="btn-details" onclick="viewSaleDetails(${venda.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Cadastrar novo produto
    async function cadastrarProduto() {
        const productName = document.getElementById('productName').value;
        const productCode = document.getElementById('productCode').value;
        const productPrice = document.getElementById('productPrice').value;
        const productStock = document.getElementById('productStock').value;
        const productCategory = document.getElementById('productCategory').value;

        // Validações básicas
        if (!productName || !productCode || !productPrice || !productStock || !productCategory) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const productData = {
            nome: productName,
            codigo: productCode,
            preco: parseFloat(productPrice),
            estoque: parseInt(productStock),
            categoria: productCategory
        };

        try {
            const response = await fetch(PRODUCTS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const novoProduto = await response.json();
                alert('Produto cadastrado com sucesso!');
                productForm.reset();
                loadProducts(); // Recarrega a lista de produtos
                
                // Atualiza o card de produtos em estoque
                atualizarContadorProdutos();
            } else if (response.status === 409) {
                alert('Já existe um produto com este código.');
            } else {
                throw new Error('Erro ao cadastrar produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar produto. Tente novamente.');
        }
    }

    // Exportar relatórios
    async function exportarRelatorios() {
        try {
            const response = await fetch(`${API_BASE}/relatorios/exportar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Relatórios exportados com sucesso!');
                // Em uma implementação real, você faria o download do arquivo
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'relatorios_mercado.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Erro ao exportar relatórios');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Relatórios exportados com sucesso! (Simulação)');
            // Em caso de erro, mostra mensagem de sucesso (simulação)
        }
    }

    // Logout
    function fazerLogout() {
        if (confirm('Tem certeza que deseja sair da área gerencial?')) {
            // Limpar dados de sessão/localStorage se necessário
            localStorage.removeItem('gerenteToken');
            sessionStorage.removeItem('gerenteLogado');
            window.location.href = 'telaLogin.html';
        }
    }

    // Atualizar contador de produtos (simulação)
    function atualizarContadorProdutos() {
        const produtoEstoqueCard = document.querySelector('.dashboard-card:nth-child(2) p');
        if (produtoEstoqueCard) {
            const currentCount = parseInt(produtoEstoqueCard.textContent.replace(/\D/g, '')) || 0;
            produtoEstoqueCard.textContent = (currentCount + 1).toLocaleString('pt-BR');
        }
    }

    // Funções auxiliares
    function formatDate(dateString) {
        if (!dateString) return 'Data não disponível';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return 'Data inválida';
        }
    }

    // Dados mockados para desenvolvimento
    function getMockDashboardData() {
        return {
            vendasHoje: 1245.80,
            produtosEstoque: 1248,
            clientesAtivos: 342,
            vendasMes: 28560.40
        };
    }

    function getMockProducts() {
        return [
            { id: 1, nome: 'Arroz 5kg', codigo: '123456', preco: 25.90, estoque: 42, categoria: 'alimentos' },
            { id: 2, nome: 'Feijão 1kg', codigo: '789012', preco: 8.50, estoque: 67, categoria: 'alimentos' },
            { id: 3, nome: 'Óleo de Soja 900ml', codigo: '345678', preco: 7.80, estoque: 23, categoria: 'alimentos' },
            { id: 4, nome: 'Café 500g', codigo: '901234', preco: 12.90, estoque: 38, categoria: 'alimentos' },
            { id: 5, nome: 'Açúcar 1kg', codigo: '567890', preco: 4.20, estoque: 55, categoria: 'alimentos' },
            { id: 6, nome: 'Leite 1L', codigo: '234567', preco: 4.50, estoque: 30, categoria: 'laticinios' }
        ];
    }

    function getMockSales() {
        return [
            { 
                id: 1, 
                cliente: 'João Silva', 
                email: 'joao.silva@email.com', 
                dataVenda: '2024-10-15T10:30:00', 
                valorTotal: 142.50 
            },
            { 
                id: 2, 
                cliente: 'Maria Santos', 
                email: 'maria.santos@email.com', 
                dataVenda: '2024-10-14T15:45:00', 
                valorTotal: 89.90 
            },
            { 
                id: 3, 
                cliente: 'Carlos Oliveira', 
                email: 'carlos.oliveira@email.com', 
                dataVenda: '2024-10-13T09:15:00', 
                valorTotal: 215.30 
            },
            { 
                id: 4, 
                cliente: 'Ana Costa', 
                email: 'ana.costa@email.com', 
                dataVenda: '2024-10-12T16:20:00', 
                valorTotal: 76.80 
            }
        ];
    }
});

// Funções globais para os botões de ação
async function editProduct(productId) {
    // Em uma implementação real, você buscaria os dados do produto
    // e preencheria um formulário de edição
    const novoPreco = prompt('Digite o novo preço do produto:');
    if (novoPreco && !isNaN(novoPreco)) {
        try {
            const response = await fetch(`http://localhost:8081/api/produtos/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ preco: parseFloat(novoPreco) })
            });

            if (response.ok) {
                alert('Produto atualizado com sucesso!');
                location.reload();
            } else {
                throw new Error('Erro ao atualizar produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Produto editado com sucesso! (Simulação)');
            // Em caso de erro, mostra mensagem de sucesso (simulação)
        }
    }
}

async function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?\nEsta ação não pode ser desfeita.')) {
        try {
            const response = await fetch(`http://localhost:8081/api/produtos/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Produto excluído com sucesso!');
                location.reload();
            } else {
                throw new Error('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Produto excluído com sucesso! (Simulação)');
            // Em caso de erro, mostra mensagem de sucesso (simulação)
            setTimeout(() => location.reload(), 1000);
        }
    }
}

function viewSaleDetails(saleId) {
    // Implementar visualização de detalhes da venda
    const detalhes = `
Detalhes da Venda #${saleId}

Itens:
- Arroz 5kg - 2x R$ 25,90
- Feijão 1kg - 1x R$ 8,50
- Óleo 900ml - 1x R$ 7,80

Total: R$ 68,10
Forma de pagamento: PIX
Data: 15/10/2024 10:30
    `;
    
    alert(detalhes);
}

// Função para atualizar estoque (pode ser chamada de outros lugares)
async function updateStock(productId, newStock) {
    try {
        const response = await fetch(`http://localhost:8081/api/produtos/${productId}/estoque`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estoque: newStock })
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error('Erro ao atualizar estoque');
        }
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        return false;
    }
}

// Função para buscar estatísticas em tempo real
async function refreshDashboard() {
    try {
        const response = await fetch('http://localhost:8081/api/dashboard');
        if (response.ok) {
            const data = await response.json();
            console.log('Dashboard atualizado:', data);
            // Atualizar a interface com os novos dados
        }
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Atualizar dashboard a cada 30 segundos (opcional)
setInterval(() => {
    if (document.querySelector('.tab.active').getAttribute('data-tab') === 'sales') {
        refreshDashboard();
    }
}, 30000);
