package fi.csc.oaipmh.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class MetadataRequest {

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateMin;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateMax;

    private Integer materialPerPage;
    private Integer pageNumber;

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

    public Integer getMaterialPerPage() {
        return materialPerPage;
    }

    public void setMaterialPerPage(Integer materialPerPage) {
        this.materialPerPage = materialPerPage;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }
}
