package net.pi.springboot_app.repository; // Ajuste para net.pi.springboot_app.Repository se a pasta for maiúscula

import net.pi.springboot_app.model.Usuario; // Importa a Entidade Usuario
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // Importe esta classe


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // <Tipo da Entidade, Tipo da Chave Primária (id)>
    Optional<Usuario> findByEmailAndSenha(String email, String senha);
    Optional<Usuario> findByEmail(String email);
}