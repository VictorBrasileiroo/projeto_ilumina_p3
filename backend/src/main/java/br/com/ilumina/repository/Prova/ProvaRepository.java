package br.com.ilumina.repository.Prova;

import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.StatusProva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProvaRepository extends JpaRepository<Prova, UUID> {

    List<Prova> findByProfessorIdAndStatusOrderByCreatedAtDesc(UUID professorId, StatusProva status);

    List<Prova> findByProfessorIdOrderByCreatedAtDesc(UUID professorId);

    List<Prova> findByTurmaIdAndStatus(UUID turmaId, StatusProva status);

    List<Prova> findByTurmaIdInAndStatus(List<UUID> turmaIds, StatusProva status);
}
