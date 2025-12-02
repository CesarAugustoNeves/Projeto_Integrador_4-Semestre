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

    // 1. ENDPOINT DE CADASTRO
    // O tipo de retorno deve ser ResponseEntity<Usuario> para permitir o status 409
    @PostMapping
    public ResponseEntity<Usuario> cadastrarUsuario(@RequestBody Usuario usuario) {
        
        // 1. VERIFICAÇÃO: Checa se o e-mail já existe no DB
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
    
    // 2. NOVO ENDPOINT DE LOGIN
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