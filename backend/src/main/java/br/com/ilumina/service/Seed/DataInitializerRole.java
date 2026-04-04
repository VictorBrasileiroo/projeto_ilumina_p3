package br.com.ilumina.service.Seed;

import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.User.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializerRole implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        List<String> roles = List.of(
                "ROLE_ADMIN",
                "ROLE_PROFESSOR",
                "ROLE_ALUNO"
        );

        for (String roleName : roles) {
            roleRepository.findUserRoleByName(roleName).orElseGet(() -> {
                UserRole role = new UserRole();
                role.setName(roleName);
                return roleRepository.save(role);
            });
        }
    }
}
