package br.com.ilumina.repository.Professor;

import br.com.ilumina.entity.Professor.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {
    Optional<Professor> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    List<Professor> findAllByOrderByCreatedAtDesc();
    List<Professor> findByUserActiveTrueOrderByCreatedAtDesc();
}
