package net.pi.springboot_app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("/bem-vindo") 
    public String welcome(){
        return "Bem-vindo ao programa usando springboot";
    }
}