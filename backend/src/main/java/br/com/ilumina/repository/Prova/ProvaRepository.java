package br.com.ilumina.repository.Prova;

import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.StatusProva;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProvaRepository extends JpaRepository<Prova, UUID> {

    List<Prova> findByProfessorIdAndStatusOrderByCreatedAtDesc(UUID professorId, StatusProva status);

    List<Prova> findByProfessorIdOrderByCreatedAtDesc(UUID professorId);

    List<Prova> findByTurmaIdAndStatus(UUID turmaId, StatusProva status);

    List<Prova> findByTurmaIdInAndStatus(List<UUID> turmaIds, StatusProva status);

    @Query("SELECT p FROM Prova p WHERE LOWER(p.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(p.disciplina, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY p.titulo")
    List<Prova> searchByTituloOuDisciplina(@Param("q") String q, Pageable pageable);

    @Query("SELECT p FROM Prova p WHERE p.professor.id = :professorId AND " +
            "(LOWER(p.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(p.disciplina, '')) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY p.titulo")
    List<Prova> searchByTituloOuDisciplinaAndProfessor(@Param("q") String q, @Param("professorId") UUID professorId, Pageable pageable);

    @Query("SELECT p FROM Prova p WHERE p.status = br.com.ilumina.entity.Prova.StatusProva.PUBLICADA " +
            "AND p.turma.id IN (SELECT at.turma.id FROM AlunoTurma at WHERE at.aluno.id = :alunoId) " +
            "AND (LOWER(p.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(p.disciplina, '')) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY p.titulo")
    List<Prova> searchPublicadasParaAluno(@Param("q") String q, @Param("alunoId") UUID alunoId, Pageable pageable);
}
