package br.com.ilumina.repository.User;

import br.com.ilumina.entity.User.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<UserRole, UUID> {
    Optional<UserRole> findUserRoleByName(String name);
}
