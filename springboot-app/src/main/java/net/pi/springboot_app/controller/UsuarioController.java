package net.pi.springboot_app.controller; 

import net.pi.springboot_app.model.Usuario;
import net.pi.springboot_app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*;

import java.util.Optional; 

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://127.0.0.1:5500") 
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static boolean validarCPF(String cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^0-9]", "");

        // Verifica se o CPF tem 11 dígitos
        if (cpf.length() != 11) {
            return false;
        }

        // Checa se todos os dígitos são iguais (ex: 111.111.111-11)
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Calcula o primeiro dígito verificador
        try {
            int d1 = 0;
            for (int i = 0; i < 9; i++) {
                d1 += (cpf.charAt(i) - '0') * (10 - i);
            }
            d1 = 11 - (d1 % 11);
            if (d1 > 9) d1 = 0;
            
            // Compara com o primeiro dígito verificador fornecido
            if ((cpf.charAt(9) - '0') != d1) {
                return false;
            }

            // Calcula o segundo dígito verificador
            int d2 = 0;
            for (int i = 0; i < 10; i++) {
                d2 += (cpf.charAt(i) - '0') * (11 - i);
            }
            d2 = 11 - (d2 % 11);
            if (d2 > 9) d2 = 0;

            // Compara com o segundo dígito verificador fornecido
            if ((cpf.charAt(10) - '0') != d2) {
                return false;
            }
            
        } catch (Exception e) {
            // Em caso de erro na conversão (deve ser evitado pelo replaceAll)
            return false;
        }

        return true;
    }

    // ENDPOINT DE CADASTRO
    // O tipo de retorno deve ser ResponseEntity<Usuario> para permitir o status 409
    @PostMapping
    public ResponseEntity<Usuario> cadastrarUsuario(@RequestBody Usuario usuario) {
        
        if (usuario.getCPF() == null || !validarCPF(usuario.getCPF())) {
            // Retorna 400 Bad Request se o CPF for inválido
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); 
        }
        // VERIFICAÇÃO: Checa se o e-mail já existe no DB
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());
        
        if (usuarioExistente.isPresent()) {
            // SE EXISTIR: Retorna status 409 (Conflict) sem corpo
            return new ResponseEntity<>(HttpStatus.CONFLICT); 
        }

        // SE NÃO EXISTIR: Salva o novo usuário
        Usuario novoUsuario = usuarioRepository.save(usuario);
        
        // Retorna o novo usuário com status 201 Created
        return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED); 
    }
    
    
    // NOVO ENDPOINT DE LOGIN
    @PostMapping("/login") 
    public ResponseEntity<Usuario> loginUsuario(@RequestBody Usuario credenciais) {
        
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmailAndSenha(
            credenciais.getEmail(), 
            credenciais.getSenha()
        );

        if (usuarioEncontrado.isPresent()) {
            return new ResponseEntity<>(usuarioEncontrado.get(), HttpStatus.OK); 
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }
}