package br.com.ilumina.entity.Professor;

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
@Table(name = "professores",uniqueConstraints = {
@UniqueConstraint(name = "uk_professores_user_id", columnNames = "user_id")}
)
public class Professor extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "disciplina", nullable = false, length = 100)
    private String disciplina;

    @Column(name = "sexo", nullable = false, length = 30)
    private String sexo;
}
