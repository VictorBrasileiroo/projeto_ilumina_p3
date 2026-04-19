package br.com.ilumina.repository.Flashcard;

import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ColecoesFlashcardRepository extends JpaRepository<ColecoesFlashcard, UUID> {
    List<ColecoesFlashcard> findByProfessor_Id(UUID professorId);
    List<ColecoesFlashcard> findByTurmaIdInAndStatus(List<UUID> turmaIds, StatusColecao status);
}