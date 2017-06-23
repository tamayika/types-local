import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export function createTempDir() {
    const dirName = path.join(os.tmpdir(), (Math.random() * 12345).toString());
    fs.mkdirSync(dirName);
    return dirName;
}
