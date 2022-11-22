package fi.csc.processor.model.document;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class BaseCollection implements Serializable {

    @Id
    protected ObjectId id;

//    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    protected LocalDateTime timestamp;
    protected String sessionId;

}
