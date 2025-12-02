package net.pi.springboot_app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "produtos") // Define o nome da tabela no banco
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String codigo; // O código de barras (ex: "123456")

    @Column(nullable = false)
    private Double preco;

    @Column(nullable = false)
    private Integer estoque;

    private String categoria;

    // Construtor vazio (obrigatório para JPA)
    public Produto() {}

    // Construtor cheio
    public Produto(String nome, String codigo, Double preco, Integer estoque, String categoria) {
        this.nome = nome;
        this.codigo = codigo;
        this.preco = preco;
        this.estoque = estoque;
        this.categoria = categoria;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }

    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}