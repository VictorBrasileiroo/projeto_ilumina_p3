package br.com.ilumina.entity.Prova;

import br.com.ilumina.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Entity
@Table(
        name = "itens_resposta_aluno",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_itens_resposta_aluno_resposta_questao",
                        columnNames = {"resposta_aluno_id", "questao_id"}
                )
        }
)
public class ItemRespostaAluno extends BaseEntity {

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resposta_aluno_id", nullable = false)
    private RespostaAluno respostaAluno;

    @Column(name = "questao_id", nullable = false)
    private UUID questaoId;

    @Column(name = "enunciado", nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Column(name = "ordem", nullable = false)
    private Integer ordem;

    @Column(name = "letra_escolhida", nullable = false, length = 1)
    private String letraEscolhida;

    @Column(name = "gabarito", nullable = false, length = 1)
    private String gabarito;

    @Column(name = "acertou", nullable = false)
    private boolean acertou;

    @Column(name = "pontuacao", nullable = false, precision = 7, scale = 2)
    private BigDecimal pontuacao;
}
