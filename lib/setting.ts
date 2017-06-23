import * as fs from "fs";
import * as logger from "./logger";

export class Setting {
    private static FilePath = "types-local.json";
    private static InstallDir = "types-local";

    public installDir = Setting.InstallDir;
    public initializeFailed = false;

    public constructor() {
        if (fs.existsSync(Setting.FilePath)) {
            let setting: any;
            try {
                setting = JSON.parse(fs.readFileSync(Setting.FilePath).toString());
            } catch (e) {
                logger.error(`${Setting.FilePath} is not valid JSON.`);
                logger.error(e);
                this.initializeFailed = true;
                return;
            }
            this.installDir = this.readString(setting, "installDir", Setting.InstallDir);
            if (this.installDir.match(/\/$/)) {
                this.installDir = this.installDir.substring(0, this.installDir.length - 1);
            }
        }
    }

    public save() {
        fs.writeFileSync(Setting.FilePath, JSON.stringify({
            installDir: this.installDir,
        }, null, 2));
    }

    private readString(setting: object, key: string, defaultValue: string) {
        if (!(key in setting)) {
            return defaultValue;
        }
        if (typeof setting[key] === "string") {
            return setting[key];
        }
        return defaultValue;
    }
}
