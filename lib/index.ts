import * as detectIndent from "detect-indent";
import * as dtsGen from "dts-gen";
import * as fs from "fs";
import * as path from "path";
import * as sortKeys from "sort-keys";

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

function getModuleVersion(moduleName: string) {
    let dir = path.normalize(process.cwd());
    while (true) {
        try {
            const nodeModulesDir = path.join(dir, "node_modules");
            fs.statSync(nodeModulesDir);
            const moduleDir = path.join(nodeModulesDir, moduleName);
            fs.statSync(moduleDir);
            const packageJsonPath = path.join(moduleDir, "package.json");
            fs.statSync(packageJsonPath);
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
            if (packageJson.version) {
                return packageJson.version;
            }
        } catch (e) {
            if (process.env.debug) {
                console.error(e);
            }
        }
        const prevDir = dir;
        dir = path.normalize(path.join(dir, ".."));
        if (prevDir === dir) {
            break;
        }
    }
    return "";
}

function writePackageJson(
    moduleName: string, moduleVersion: string,
    typesLocalmoduleDirPath: string) {
    const jsonPath = path.join(typesLocalmoduleDirPath, "package.json");
    const info = {
        dependencies: {},
        description: "TypeScript definitions for " + moduleName + " " + moduleVersion,
        name: "@types/" + moduleName,
        typings: "index.d.ts",
        version: moduleVersion,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
}

function writeDts(typesLocalmoduleDirPath: string, result: string) {
    fs.writeFileSync(path.join(typesLocalmoduleDirPath, "index.d.ts"), result);
}

function updateTsConfigJson(moduleName: string) {
    const path = "tsconfig.json";
    if (!fs.existsSync(path)) {
        return;
    }

    // add baseUrl=.
    // add paths[${moduleName}]=[types-local/${moduleName}]
    const jsonContent = fs.readFileSync(path).toString();
    const indentAmount = detectIndent(jsonContent).amount || 4;
    const tsConfig = JSON.parse(jsonContent);
    const compilerOptions = tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    const baseUrl = compilerOptions.baseUrl = compilerOptions.baseUrl || ".";
    const paths = compilerOptions.paths = compilerOptions.paths || {};
    paths[moduleName] = [`types-local/${moduleName}`];
    sortKeys(tsConfig, { deep: true });
    fs.writeFileSync(path, JSON.stringify(tsConfig, null, indentAmount));
}

export function createTypesLocalPackage(
    moduleName: string, callback?: () => void) {
    const module = require(moduleName);
    const result = dtsGen.generateModuleDeclarationFile(moduleName, module);

    const typesLocalDirName = "types-local";
    const typesLocalmoduleDirPath = path.join(typesLocalDirName, moduleName);

    const moduleVersion = getModuleVersion(moduleName);
    prepareDirectory(typesLocalDirName, typesLocalmoduleDirPath);
    writePackageJson(moduleName, moduleVersion, typesLocalmoduleDirPath);
    writeDts(typesLocalmoduleDirPath, result);
    updateTsConfigJson(moduleName);
    if (callback) {
        callback();
    }
}
