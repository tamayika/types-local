#!/usr/bin/env node

import * as yargs from "yargs";
import * as TypesLocal from "./index";

function main() {
    const args = yargs
        .usage("Usage: $0 <module-name> [options]")
        .help("h")
        .alias("h", "help");
    const argv = args.argv;
    if (argv._.length === 0) {
        args.showHelp();
        return;
    }
    TypesLocal.createTypesLocalPackage(argv._[0]);
}

main();
