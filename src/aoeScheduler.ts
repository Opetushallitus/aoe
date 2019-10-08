const fh = require("./queries/fileHandling");
setInterval(() => fh.checkTemporaryRecordQueue(), 3600000);