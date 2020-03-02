package fi.csc.data.entity;

@SuppressWarnings("unused")
public interface Identifier {

    Long getEducationalMaterialId();
    Long getMaterialId();
    String getOriginalFileName();
    String getFileKey();

}
