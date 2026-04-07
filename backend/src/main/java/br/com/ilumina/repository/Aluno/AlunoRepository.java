package br.com.ilumina.repository.Aluno;

import br.com.ilumina.entity.Aluno.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlunoRepository extends JpaRepository<Aluno, UUID> {
    Optional<Aluno> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    boolean existsByMatricula(String matricula);
    List<Aluno> findAllByOrderByCreatedAtDesc();
    List<Aluno> findByUserActiveTrueOrderByCreatedAtDesc();
}
