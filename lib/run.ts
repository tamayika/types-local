#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import * as TypesLocal from "./index";

function main() {
    const args = yargs
        .usage("Usage: types-local <module-name> [options]")
        .help("h")
        .alias("h", "help")
        .version(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json")).toString()).version)
        .alias("v", "version");
    const argv = args.argv;
    if (argv._.length === 0) {
        args.showHelp();
        return;
    }
    TypesLocal.createTypesLocalPackage(argv._[0]);
}

main();
