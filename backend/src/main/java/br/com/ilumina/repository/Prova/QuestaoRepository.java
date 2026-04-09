package br.com.ilumina.repository.Prova;

import br.com.ilumina.entity.Prova.Questao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestaoRepository extends JpaRepository<Questao, UUID> {

    List<Questao> findByProvaIdOrderByOrdem(UUID provaId);

    long countByProvaId(UUID provaId);
}
