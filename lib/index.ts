import * as fs from "fs";
import * as path from "path";
import * as requireg from "requireg";
import { NPM } from "npm";
const npm = requireg("npm") as NPM.Static;
import * as dtsGen from "dts-gen";

function prepareDirectory(typesLocalDirName: string, typesLocalmoduleDirPath: string) {
    try {
        fs.statSync(typesLocalDirName);
    } catch (e) {
        fs.mkdirSync(typesLocalDirName);
    }
    try {
        fs.statSync(typesLocalmoduleDirPath);
    } catch (e) {
        fs.mkdirSync(typesLocalmoduleDirPath);
    }
}

function writePackageJson(
    moduleName: string, moduleVersion: string,
    moduleDependencies: string[], typesLocalmoduleDirPath: string) {
    const jsonPath = path.join(typesLocalmoduleDirPath, "package.json");
    const info = {
        dependencies: {},
        description: "TypeScript definitions for " + moduleName + " " + moduleVersion,
        name: "@types/" + moduleName,
        typings: "index.d.ts",
        version: moduleVersion,
    };
    if (moduleDependencies) {
        const dependencies = info.dependencies = {};
        for (const moduleDependency of moduleDependencies) {
            dependencies[`@types/${moduleDependency}`] = "*";
        }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
}

function writeDts(typesLocalmoduleDirPath: string, result: string) {
    fs.writeFileSync(path.join(typesLocalmoduleDirPath, "index.d.ts"), result);
}

export function createTypesLocalPackage(
    moduleName: string, moduleDependencies: string[],
    installByNpm: boolean, callback?: () => void) {
    const module = require(moduleName);
    const result = dtsGen.generateModuleDeclarationFile(moduleName, module);

    const typesLocalDirName = "types-local";
    const typesLocalmoduleDirPath = path.join(typesLocalDirName, moduleName);

    npm.load({ save: true }, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        npm.commands.info([moduleName], function (err2, data) {
            if (err2) {
                console.error(err2);
                return;
            }
            const moduleVersion = Object.keys(data)[0];
            prepareDirectory(typesLocalDirName, typesLocalmoduleDirPath);
            writePackageJson(moduleName, moduleVersion, moduleDependencies, typesLocalmoduleDirPath);
            writeDts(typesLocalmoduleDirPath, result);
            if (installByNpm) {
                npm.commands.install([typesLocalmoduleDirPath], () => {
                    if (callback) {
                        callback();
                    }
                });
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    });
}
