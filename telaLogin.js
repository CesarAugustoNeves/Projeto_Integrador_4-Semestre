// Criado por Enryco
const form = document.getElementById('loginForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Pega os dados do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 2. Objeto JSON a ser enviado (os nomes das chaves devem ser iguais aos da Entidade Java)
    const credenciais = {
        email: email,
        senha: password 
    };

    // 3. Define o endpoint de LOGIN
    const url = 'http://localhost:8081/api/usuarios/login';

    // 4. Faz a requisição POST para o servidor
    fetch(url, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(credenciais) 
    })
    .then(response => {
        if (response.status === 200) {
            // SUCESSO! O servidor retornou OK (200)
            return response.json(); 
        } else if (response.status === 401) {
            // FALHA! O servidor retornou Não Autorizado (401)
            throw new Error('E-mail ou senha inválidos.'); 
        } else {
            // Outros erros de servidor (5xx)
            throw new Error('Erro ao tentar conectar ao servidor. Status: ' + response.status);
        }
    })
    .then(data => {
        // Se o login for bem-sucedido:
        console.log('Login bem-sucedido!', data);
        alert('Login realizado com sucesso! Bem-vindo(a).');
        
        // REDIRECIONAMENTO para a página de escanear produto
        window.location.href = 'escanearProduto.html';
    })
    .catch(error => {
        // Se houver qualquer erro (rede ou 401/500), mostra a mensagem de erro
        console.error('Erro de login:', error);
        alert(error.message); // Exibe 'E-mail ou senha inválidos.' ou o erro de rede.
    });
});
