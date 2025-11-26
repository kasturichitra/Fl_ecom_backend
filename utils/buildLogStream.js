import * as rfs from "rotating-file-stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogStream = rfs.createStream("http.access.log", {
  interval: "1d",
  path: path.join(__dirname, "../logs"),
});

export default accessLogStream;
