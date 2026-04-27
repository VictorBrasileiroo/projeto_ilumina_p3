package br.com.ilumina.repository.Aluno;

import br.com.ilumina.entity.Aluno.Aluno;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlunoRepository extends JpaRepository<Aluno, UUID> {
    Optional<Aluno> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    boolean existsByMatricula(String matricula);
    List<Aluno> findAllByOrderByCreatedAtDesc();
    List<Aluno> findByUserActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT a FROM Aluno a WHERE a.user.active = true AND " +
            "(LOWER(a.user.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(a.matricula) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY a.user.name")
    List<Aluno> searchAtivosByNomeOuMatricula(@Param("q") String q, Pageable pageable);

    @Query("SELECT a FROM Aluno a WHERE a.user.active = true " +
            "AND a.id IN (SELECT at.aluno.id FROM AlunoTurma at " +
            "             JOIN ProfTurma pt ON pt.turma = at.turma " +
            "             WHERE pt.professor.id = :professorId) " +
            "AND (LOWER(a.user.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(a.matricula) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "ORDER BY a.user.name")
    List<Aluno> searchAtivosByNomeOuMatriculaAndProfessor(@Param("q") String q, @Param("professorId") UUID professorId, Pageable pageable);
}
