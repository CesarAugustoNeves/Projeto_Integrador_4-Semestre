document.addEventListener('DOMContentLoaded', function() {
    //Feito por: CESAR AUGUSTO NEVES
    // Garantir de que o ID do formulário no HTML é 'loginForm'
    const form = document.getElementById('loginForm'); 

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Pega os valores digitados pelo usuário
        const cpf = document.getElementById('cpf').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const nome = document.getElementById('nome').value;


        function validarCPF(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, ""); 

        // Verifica se tem 11 dígitos e se não são todos iguais
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        return true; 
        }

        // Validação do CPF
        if (!validarCPF(cpf)) {
            // Se o CPF for inválido
            alert('CPF inválido. Por favor, verifique o número digitado.');
            return; // Impede o envio do formulário
        }
     
        // Cria o objeto JavaScript
        const dadosUsuario = {
            cpf: cpf,
            email: email,
            senha: password,
            nome: nome
        };

        // Define a URL do Endpoint no Spring Boot
        const url = 'http://localhost:8081/api/usuarios';

        // Faz a requisição POST para o servidor
        fetch(url, {
            method: 'POST', // Método para enviar novos dados
            headers: {
                // Diz ao servidor que o corpo da requisição é JSON
                'Content-Type': 'application/json' 
            },
            // Converte o objeto JavaScript em uma string JSON para envio
            body: JSON.stringify(dadosUsuario) 
        })
        .then(response => {
            // TRATA O ERRO 409 (E-mail Duplicado)
            if (response.status === 409) {
               throw new Error('E-mail já cadastrado. Tente outro.'); 
            }
            // TRATA OUTROS ERROS QUE NÃO SEJAM O 409 E O SUCESSO 201
            if (!response.ok) {
               throw new Error('Falha no cadastro. Servidor retornou: ' + response.status);
            }

           // Retorna a resposta JSON para o próximo .then() (SUCESSO)
            return response.json(); 
        })
        .then(data => {
            // SUCESSO! O usuário salvo no db.
            console.log('Usuário cadastrado com sucesso! ID:', data.id);
            alert('Cadastro realizado com sucesso! Pode fazer o login.');
            form.reset();
        })
        .catch(error => {
            // ERRO! Mesmo email ja cadastrado.
            console.error('Erro ao enviar dados:', error);
            alert('E-mail já cadastrado tente outro');
        });
    });
});