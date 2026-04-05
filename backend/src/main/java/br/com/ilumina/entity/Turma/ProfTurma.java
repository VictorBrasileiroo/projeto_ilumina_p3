package br.com.ilumina.entity.Turma;

import br.com.ilumina.entity.BaseEntity;
import br.com.ilumina.entity.Professor.Professor;
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
        name = "prof_turma",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_prof_turma_professor_turma",
                        columnNames = {"professor_id", "turma_id"}
                )
        }
)
public class ProfTurma extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;
}
