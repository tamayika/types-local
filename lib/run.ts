#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import * as TypesLocal from "./index";
import * as logger from "./logger";
import { Setting } from "./setting";

function main() {
    const args = yargs
        .usage("Usage: types-local <command> <module-name> [options]")
        .command("init", "initialize types-local.json")
        .command("install", "install types-local directory and package")
        .command("uninstall", "uninstall types-local directory and package")
        .help("h")
        .alias("h", "help")
        .version(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json")).toString()).version)
        .alias("v", "version");
    const argv = args.argv;
    switch (argv._.length) {
        case 0:
            args.showHelp();
            return;
        default:
            const command: string = argv._[0];
            const setting = new Setting();
            if (setting.initializeFailed) {
                return;
            }
            switch (command) {
                case "init":
                    if (!setting.defaultLoaded) {
                        logger.error(`${Setting.FilePath} already exists.`);
                    } else {
                        setting.save();
                        logger.info(`${Setting.FilePath} created.`);
                    }
                    break;
                default:
                    if ("install".indexOf(command) === 0) {
                        TypesLocal.createTypesLocalPackages(argv._.slice(1), setting);
                    } else if ("uninstall".indexOf(command) === 0) {
                        TypesLocal.removeTypesLocalPackages(argv._.slice(1), setting);
                    } else {
                        logger.error(`${argv._[0]} is not supported command.`);
                    }
                    break;
            }
            break;
    }
}

main();
