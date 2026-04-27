package br.com.ilumina.repository.Flashcard;

import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ColecoesFlashcardRepository extends JpaRepository<ColecoesFlashcard, UUID> {
    List<ColecoesFlashcard> findByProfessor_Id(UUID professorId);
    List<ColecoesFlashcard> findByTurmaIdInAndStatus(List<UUID> turmaIds, StatusColecao status);

    @Query("SELECT c FROM ColecoesFlashcard c WHERE LOWER(c.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(c.tema, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY c.titulo")
    List<ColecoesFlashcard> searchByTituloOuTema(@Param("q") String q, Pageable pageable);

    @Query("SELECT c FROM ColecoesFlashcard c WHERE c.professor.id = :professorId AND " +
            "(LOWER(c.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(c.tema, '')) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY c.titulo")
    List<ColecoesFlashcard> searchByTituloOuTemaAndProfessor(@Param("q") String q, @Param("professorId") UUID professorId, Pageable pageable);

    @Query("SELECT c FROM ColecoesFlashcard c WHERE c.status = br.com.ilumina.entity.Flashcard.StatusColecao.PUBLICADA " +
            "AND c.turma.id IN (SELECT at.turma.id FROM AlunoTurma at WHERE at.aluno.id = :alunoId) " +
            "AND (LOWER(c.titulo) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(COALESCE(c.tema, '')) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY c.titulo")
    List<ColecoesFlashcard> searchPublicadasParaAluno(@Param("q") String q, @Param("alunoId") UUID alunoId, Pageable pageable);
}
