package net.pi.springboot_app.repository;

import net.pi.springboot_app.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    // Método extra para buscar pelo código de barras (usado no scanner)
    Optional<Produto> findByCodigo(String codigo);
}