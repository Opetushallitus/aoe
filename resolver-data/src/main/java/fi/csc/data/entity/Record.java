package fi.csc.data.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Record")
@Table(name = "Record")
public class Record {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "MaterialId", referencedColumnName = "Id", insertable = false, updatable = false)
    private Material material;

    @Column(name = "MaterialId")
    private Long materialId;

    @Column(name = "FilePath")
    private String filePath;

    @Column(name = "OriginalFileName")
    private String originalFileName;

    @Column(name = "FileSize")
    private Integer fileSize;

    @Column(name = "MimeType")
    private String mimeType;

    @Column(name = "Format")
    private String format;

    @Column(name = "FileKey")
    private String fileKey;

    @Column(name = "FileBucket")
    private String fileBucket;

}
