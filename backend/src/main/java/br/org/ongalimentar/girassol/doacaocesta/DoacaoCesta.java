package br.org.ongalimentar.girassol.doacaocesta;

import br.org.ongalimentar.girassol.familia.Familia;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doacoes_cestas")
public class DoacaoCesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate data;

    @ManyToOne(optional = false)
    @JoinColumn(name = "familia_id", nullable = false)
    private Familia familia;

    @OneToMany(mappedBy = "doacaoCesta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCesta> itens = new ArrayList<>();

    public DoacaoCesta() {
    }

    @PrePersist
    void definirData() {
        if (data == null) {
            data = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Familia getFamilia() {
        return familia;
    }

    public void setFamilia(Familia familia) {
        this.familia = familia;
    }

    public List<ItemCesta> getItens() {
        return itens;
    }

    public void addItem(ItemCesta item) {
        itens.add(item);
        item.setDoacaoCesta(this);
    }

    public void removeItem(ItemCesta item) {
        if (itens.remove(item)) {
            item.setDoacaoCesta(null);
        }
    }
}
