package br.com.ilumina.entity.Aluno;

import br.com.ilumina.entity.BaseEntity;
import br.com.ilumina.entity.User.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(name = "alunos", uniqueConstraints = {
        @UniqueConstraint(name = "uk_alunos_user_id", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_alunos_matricula", columnNames = "matricula")
})
public class Aluno extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "matricula", nullable = false, length = 50, unique = true)
    private String matricula;

    @Column(name = "sexo", nullable = false, length = 30)
    private String sexo;
}
