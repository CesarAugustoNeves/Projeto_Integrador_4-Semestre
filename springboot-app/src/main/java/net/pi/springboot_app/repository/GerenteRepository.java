package net.pi.springboot_app.repository;

import net.pi.springboot_app.model.Gerente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GerenteRepository extends JpaRepository<Gerente, Long> {
    Optional<Gerente> findByEmailAndSenha(String email, String senha);
    Optional<Gerente> findByEmail(String email);
}