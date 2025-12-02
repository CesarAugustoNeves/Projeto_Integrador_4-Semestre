package net.pi.springboot_app.controller;

import net.pi.springboot_app.model.Gerente;
import net.pi.springboot_app.repository.GerenteRepository;
import net.pi.springboot_app.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gerentes")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class GerenteController {

    @Autowired
    private GerenteRepository gerenteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // 1. LOGIN DE GERENTE
    @PostMapping("/login")
    public ResponseEntity<Gerente> login(@RequestBody Gerente credenciais) {
        Optional<Gerente> gerente = gerenteRepository.findByEmailAndSenha(
            credenciais.getEmail(), 
            credenciais.getSenha()
        );

        return gerente.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                      .orElseGet(() -> new ResponseEntity<>(HttpStatus.UNAUTHORIZED));
    }

    // 2. CADASTRAR NOVO GERENTE (Útil para setup inicial via Postman)
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Gerente gerente) {
        if (gerenteRepository.findByEmail(gerente.getEmail()).isPresent()) {
            return new ResponseEntity<>("Email já cadastrado", HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(gerenteRepository.save(gerente), HttpStatus.CREATED);
    }

    // 3. DADOS DO DASHBOARD (Agregador)
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Exemplo real usando o repository de produtos criado anteriormente
        long totalProdutos = produtoRepository.count();
        
        
        
        double vendasHoje = 0.0; // vendaRepository.somaVendasHoje();
        long clientesAtivos = 0; // usuarioRepository.count();
        double vendasMes = 0.0;  // vendaRepository.somaVendasMes();

        stats.put("vendasHoje", vendasHoje);
        stats.put("produtosEstoque", totalProdutos);
        stats.put("clientesAtivos", clientesAtivos); 
        stats.put("vendasMes", vendasMes);

        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
}