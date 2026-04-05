package br.com.ilumina.entity.Turma;

import br.com.ilumina.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "turmas")
public class Turma extends BaseEntity {

    @Column(name = "nome", nullable = false, length = 60)
    private String nome;

    @Column(name = "ano", nullable = false)
    private Integer ano;

    @Enumerated(EnumType.STRING)
    @Column(name = "turno", nullable = false, length = 20)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    @Column(name = "ensino", nullable = false, length = 20)
    private Ensino ensino;

    @Column(name = "qnt_alunos", nullable = false)
    private Integer qntAlunos;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
