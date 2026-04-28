package br.com.ilumina.entity.Prova;

import br.com.ilumina.entity.BaseEntity;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.Turma;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "provas")
public class Prova extends BaseEntity {

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "disciplina", length = 100)
    private String disciplina;

    @Column(name = "qnt_questoes")
    private Integer qntQuestoes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusProva status = StatusProva.RASCUNHO;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @ToString.Exclude
    @OneToMany(mappedBy = "prova", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Questao> questoes = new ArrayList<>();
}
