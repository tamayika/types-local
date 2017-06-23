#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import * as TypesLocal from "./index";
import * as logger from "./logger";

function main() {
    const args = yargs
        .usage("Usage: types-local <command> <module-name> [options]")
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
        case 1:
            TypesLocal.createTypesLocalPackage(argv._[0]);
            break;
        default:
            const command: string = argv._[0];
            if ("install".indexOf(command) === 0) {
                TypesLocal.createTypesLocalPackages(argv._.slice(1));
            } else if ("uninstall".indexOf(command) === 0) {
                TypesLocal.removeTypesLocalPackages(argv._.slice(1));
            } else {
                logger.warn(`${argv._[0]} is not supported command.`);
            }
            break;
    }
}

main();
