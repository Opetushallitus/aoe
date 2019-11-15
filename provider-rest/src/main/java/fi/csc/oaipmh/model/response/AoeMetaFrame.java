package fi.csc.oaipmh.model.response;

@SuppressWarnings("unused")
public class AoeMetaFrame<T> {

    private String dateMin;
    private String dateMAx;
    private Integer materialPerPage;
    private Integer pageNumber;
    private Integer pageTotal;
    private Long completeListSize;
    private T content;

    public String getDateMin() {
        return dateMin;
    }

    public void setDateMin(String dateMin) {
        this.dateMin = dateMin;
    }

    public String getDateMAx() {
        return dateMAx;
    }

    public void setDateMAx(String dateMAx) {
        this.dateMAx = dateMAx;
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

    public Integer getPageTotal() {
        return pageTotal;
    }

    public void setPageTotal(Integer pageTotal) {
        this.pageTotal = pageTotal;
    }

    public Long getCompleteListSize() {
        return completeListSize;
    }

    public void setCompleteListSize(Long completeListSize) {
        this.completeListSize = completeListSize;
    }

    public T getContent() {
        return content;
    }

    public void setContent(T content) {
        this.content = content;
    }
}
