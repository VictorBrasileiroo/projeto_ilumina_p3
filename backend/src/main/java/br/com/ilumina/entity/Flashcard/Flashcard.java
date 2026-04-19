package br.com.ilumina.entity.Flashcard;

import br.com.ilumina.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "flashcards")
public class Flashcard extends BaseEntity {

    @Column(name = "texto_frente", nullable = false, columnDefinition = "TEXT")
    private String textoFrente;

    @Column(name = "texto_verso", nullable = false, columnDefinition = "TEXT")
    private String textoVerso;

    @Column(name = "ordem", nullable = false)
    private Integer ordem;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_colecao", nullable = false)
    private ColecoesFlashcard colecao;
}