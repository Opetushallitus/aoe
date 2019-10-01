package fi.csc.oaipmh.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class MetadataRequest {

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateMin;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateMax;

    private Long materialPerPage;
    private Long pageNumber;

    public LocalDateTime getDateMin() {
        return dateMin;
    }

    public void setDateMin(LocalDateTime dateMin) {
        this.dateMin = dateMin;
    }

    public LocalDateTime getDateMax() {
        return dateMax;
    }

    public void setDateMax(LocalDateTime dateMax) {
        this.dateMax = dateMax;
    }

    public Long getMaterialPerPage() {
        return materialPerPage;
    }

    public void setMaterialPerPage(Long materialPerPage) {
        this.materialPerPage = materialPerPage;
    }

    public Long getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Long pageNumber) {
        this.pageNumber = pageNumber;
    }
}
