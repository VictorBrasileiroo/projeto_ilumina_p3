package br.com.ilumina.repository.Turma;

import br.com.ilumina.entity.Turma.Turma;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TurmaRepository extends JpaRepository<Turma, UUID> {
    List<Turma> findAllByOrderByCreatedAtDesc();
    List<Turma> findByActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT t FROM Turma t WHERE t.active = true AND LOWER(t.nome) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY t.nome")
    List<Turma> searchAtivasByNome(@Param("q") String q, Pageable pageable);

    @Query("SELECT t FROM Turma t WHERE t.active = true " +
            "AND t.id IN (SELECT pt.turma.id FROM ProfTurma pt WHERE pt.professor.id = :professorId) " +
            "AND LOWER(t.nome) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY t.nome")
    List<Turma> searchAtivasByNomeAndProfessor(@Param("q") String q, @Param("professorId") UUID professorId, Pageable pageable);

    @Query("SELECT t FROM Turma t WHERE t.active = true " +
            "AND t.id IN (SELECT at.turma.id FROM AlunoTurma at WHERE at.aluno.id = :alunoId) " +
            "AND LOWER(t.nome) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY t.nome")
    List<Turma> searchAtivasByNomeAndAluno(@Param("q") String q, @Param("alunoId") UUID alunoId, Pageable pageable);
}
