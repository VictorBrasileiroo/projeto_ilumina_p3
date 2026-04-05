package br.com.ilumina.repository.Turma;

import br.com.ilumina.entity.Turma.Turma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TurmaRepository extends JpaRepository<Turma, UUID> {
    List<Turma> findAllByOrderByCreatedAtDesc();
    List<Turma> findByActiveTrueOrderByCreatedAtDesc();
}
