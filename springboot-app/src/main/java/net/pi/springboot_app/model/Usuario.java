package net.pi.springboot_app.model; // Ajuste para net.pi.springboot_app.Model se a pasta for maiúscula

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    // Campos do formulário de cadastro:
    private String email;
    private String senha; 

    // Construtor vazio (obrigatório pelo JPA)
    public Usuario() {}

    // Construtor 
    public Usuario(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}