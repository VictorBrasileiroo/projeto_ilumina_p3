package br.com.ilumina.repository.Flashcard;

import br.com.ilumina.entity.Flashcard.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByColecao_IdOrderByOrdemAsc(UUID colecaoId);
    int countByColecaoId(UUID colecaoId);
    boolean existsByIdAndColecao_Id(UUID flashcardId, UUID colecaoId);
}