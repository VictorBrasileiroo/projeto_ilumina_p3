package br.com.ilumina.entity.Turma;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(
        name = "aluno_turma",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_aluno_turma_aluno_turma",
                        columnNames = {"aluno_id", "turma_id"}
                )
        }
)
public class AlunoTurma extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;
}
