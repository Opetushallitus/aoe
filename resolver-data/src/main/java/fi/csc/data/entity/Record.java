package fi.csc.data.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Record")
@Table(name = "record")
public class Record {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "material_id")
    private Long materialId;

    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "recordMaterialFK", referencedColumnName = "id")
    private Material material;

    private String filePath;

    @Column(name = "original_file_name")
    private String originalFileName;
    private Integer fileSize;
    private String mimeType;
    private String format;
    private String fileKey;
    private String fileBucket;

    public Record(Long id, Long materialId, String originalFileName) {
        this.id = id;
        this.materialId = materialId;
        this.originalFileName = originalFileName;
    }
}
