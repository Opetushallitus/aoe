package fi.csc.processor.model.document;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class BaseCollection implements Serializable {

    @Id
    protected ObjectId id;

    @Indexed
    protected String sessionId;

    protected LocalDateTime timestamp;

}
