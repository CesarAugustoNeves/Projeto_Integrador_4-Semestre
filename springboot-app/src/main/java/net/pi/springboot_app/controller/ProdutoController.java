package net.pi.springboot_app.controller;

import net.pi.springboot_app.model.Produto;
import net.pi.springboot_app.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Permite acesso do front-end (VS Code/Live Server)
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    // 1. LISTAR TODOS OS PRODUTOS
    @GetMapping
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    // 2. BUSCAR PRODUTO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return produtoRepository.findById(id)
                .map(produto -> new ResponseEntity<>(produto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 3. BUSCAR PRODUTO POR CÓDIGO DE BARRAS (Útil para o scanner)
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Produto> buscarPorCodigo(@PathVariable String codigo) {
        return produtoRepository.findByCodigo(codigo)
                .map(produto -> new ResponseEntity<>(produto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 4. CADASTRAR NOVO PRODUTO
    @PostMapping
    public ResponseEntity<?> cadastrarProduto(@RequestBody Produto produto) {
        // Verifica se já existe um produto com o mesmo código
        if (produtoRepository.findByCodigo(produto.getCodigo()).isPresent()) {
            return new ResponseEntity<>("Código de produto já existe.", HttpStatus.CONFLICT);
        }
        
        Produto novoProduto = produtoRepository.save(produto);
        return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
    }

    // 5. ATUALIZAR PRODUTO (PUT - Atualiza tudo)
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto produtoDados) {
        return produtoRepository.findById(id)
                .map(produtoExistente -> {
                    produtoExistente.setNome(produtoDados.getNome());
                    produtoExistente.setPreco(produtoDados.getPreco());
                    produtoExistente.setCategoria(produtoDados.getCategoria());
                    // Não alteramos o código aqui para evitar conflitos, mas poderia
                    Produto atualizado = produtoRepository.save(produtoExistente);
                    return new ResponseEntity<>(atualizado, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 6. ATUALIZAR APENAS O ESTOQUE (PATCH - Usado no pagamento.js)
    @PatchMapping("/{id}/estoque")
    public ResponseEntity<?> atualizarEstoque(@PathVariable Long id, @RequestBody Map<String, Integer> update) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);

        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            if (update.containsKey("estoque")) {
                produto.setEstoque(update.get("estoque"));
                produtoRepository.save(produto);
                return new ResponseEntity<>(produto, HttpStatus.OK);
            }
            return new ResponseEntity<>("Campo 'estoque' obrigatório.", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 7. DELETAR PRODUTO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProduto(@PathVariable Long id) {
        if (produtoRepository.existsById(id)) {
            produtoRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}