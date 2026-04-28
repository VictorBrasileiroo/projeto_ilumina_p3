package br.com.ilumina.entity.Prova;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(
        name = "respostas_aluno",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_respostas_aluno_aluno_prova",
                        columnNames = {"aluno_id", "prova_id"}
                )
        }
)
public class RespostaAluno extends BaseEntity {

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prova_id", nullable = false)
    private Prova prova;

    @Column(name = "total_questoes", nullable = false)
    private Integer totalQuestoes;

    @Column(name = "total_acertos", nullable = false)
    private Integer totalAcertos;

    @Column(name = "nota_final", nullable = false, precision = 7, scale = 2)
    private BigDecimal notaFinal;

    @Column(name = "respondido_em", nullable = false, updatable = false)
    private OffsetDateTime respondidoEm;

    @ToString.Exclude
    @OneToMany(mappedBy = "respostaAluno", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("ordem ASC")
    private List<ItemRespostaAluno> itens = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        if (respondidoEm == null) {
            respondidoEm = OffsetDateTime.now();
        }
    }
}
