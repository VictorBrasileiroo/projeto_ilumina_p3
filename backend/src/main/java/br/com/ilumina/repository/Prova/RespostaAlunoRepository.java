package br.com.ilumina.repository.Prova;

import br.com.ilumina.entity.Prova.RespostaAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RespostaAlunoRepository extends JpaRepository<RespostaAluno, UUID> {

    boolean existsByAluno_IdAndProva_Id(UUID alunoId, UUID provaId);

    Optional<RespostaAluno> findByAluno_IdAndProva_Id(UUID alunoId, UUID provaId);
}
