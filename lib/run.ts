#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import * as TypesLocal from "./index";

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
        case 2:
            const command: string = argv._[0];
            if ("install".indexOf(command) === 0) {
                TypesLocal.createTypesLocalPackage(argv._[1]);
            } else if ("uninstall".indexOf(command) === 0) {
                TypesLocal.removeTypesLocalPackage(argv._[1]);
            } else {
                console.warn(`${argv._[0]} is not supported command.`);
            }
            break;
        default:
            break;
    }
}

main();
