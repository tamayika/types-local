import * as detectIndent from "detect-indent";
import * as dtsGen from "dts-gen";
import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import * as sortKeys from "sort-keys";

function dump(message) {
    if (process.env.NODE_ENV === "test") {
        // tslint:disable-next-line:no-console
        console.log(`[Dump] ${message}`);
    }
}

function info(message) {
    // tslint:disable-next-line:no-console
    console.log(`[Info] ${message}`);
}

function warn(message) {
    console.warn(message);
}

function prepareDirectory(typesLocalDirName: string, typesLocalModuleDirPath: string) {
    if (!fs.existsSync(typesLocalDirName)) {
        fs.mkdirSync(typesLocalDirName);
    }
    if (!fs.existsSync(typesLocalModuleDirPath)) {
        fs.mkdirSync(typesLocalModuleDirPath);
    }
}

function removeDirectory(typesLocalDirName: string, typesLocalModuleDirPath: string) {
    if (fs.existsSync(typesLocalModuleDirPath)) {
        rimraf.sync(typesLocalModuleDirPath);
    }
    try {
        fs.rmdirSync(typesLocalDirName);
        info("types-local dir removed successfully.");
    } catch (e) {
        dump(`${typesLocalDirName} is not empty.`);
    }
}

function getNodeModuleDir(moduleName: string) {
    let dir = path.normalize(process.cwd());
    while (true) {
        try {
            const nodeModulesDir = path.join(dir, "node_modules");
            fs.statSync(nodeModulesDir);
            const moduleDir = path.join(nodeModulesDir, moduleName);
            fs.statSync(moduleDir);
            const packageJsonPath = path.join(moduleDir, "package.json");
            fs.statSync(packageJsonPath);
            return { nodeModulesDir, moduleDir, packageJsonPath };
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
}

function requireModule(moduleName: string) {
    const nodeModuleDir = getNodeModuleDir(moduleName);
    if (nodeModuleDir) {
        return require(nodeModuleDir.moduleDir);
    }
}

function getModuleVersion(moduleName: string) {
    const nodeModuleDir = getNodeModuleDir(moduleName);
    if (nodeModuleDir) {
        const packageJson = JSON.parse(fs.readFileSync(nodeModuleDir.packageJsonPath).toString());
        if (packageJson.version) {
            return packageJson.version;
        }
    }
    return "";
}

function writePackageJson(
    moduleName: string, moduleVersion: string,
    typesLocalModuleDirPath: string) {
    const jsonPath = path.join(typesLocalModuleDirPath, "package.json");
    const info = {
        dependencies: {},
        description: "TypeScript definitions for " + moduleName + " " + moduleVersion,
        name: "@types/" + moduleName,
        typings: "index.d.ts",
        version: moduleVersion,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
}

function writeDts(typesLocalModuleDirPath: string, result: string) {
    fs.writeFileSync(path.join(typesLocalModuleDirPath, "index.d.ts"), result);
}

function updateTsConfigJson(callback: (paths: any) => any) {
    const path = "tsconfig.json";
    if (!fs.existsSync(path)) {
        warn("tsconfig.json does not exist.");
        return;
    }
    const jsonContent = fs.readFileSync(path).toString();
    const indentAmount = detectIndent(jsonContent).amount || 4;
    const tsConfig = JSON.parse(jsonContent);
    const compilerOptions = tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    const baseUrl = compilerOptions.baseUrl = compilerOptions.baseUrl || ".";
    const paths = compilerOptions.paths = compilerOptions.paths || {};
    callback(paths);
    if (!paths || Object.keys(paths).length === 0) {
        delete compilerOptions.baseUrl;
        delete compilerOptions.paths;
    }
    sortKeys(tsConfig, { deep: true });
    fs.writeFileSync(path, JSON.stringify(tsConfig, null, indentAmount));
}

function addModuleToTsConfigJson(moduleName: string) {
    // add baseUrl=.
    // add paths[${moduleName}]=[types-local/${moduleName}]
    updateTsConfigJson((paths) => {
        paths[moduleName] = [`types-local/${moduleName}`];
    });
}

function removeModuleFromTsConfigJson(moduleName: string) {
    // remove paths[${moduleName}]=[types-local/${moduleName}]
    updateTsConfigJson((paths) => {
        delete paths[moduleName];
    });
}

export function createTypesLocalPackage(moduleName: string) {
    const module = requireModule(moduleName) || require(moduleName);
    const result = dtsGen.generateModuleDeclarationFile(moduleName, module);

    const typesLocalDirName = "types-local";
    const typesLocalModuleDirPath = path.join(typesLocalDirName, moduleName);

    const moduleVersion = getModuleVersion(moduleName);
    prepareDirectory(typesLocalDirName, typesLocalModuleDirPath);
    writePackageJson(moduleName, moduleVersion, typesLocalModuleDirPath);
    writeDts(typesLocalModuleDirPath, result);
    addModuleToTsConfigJson(moduleName);
}

export function removeTypesLocalPackage(moduleName: string) {
    const typesLocalDirName = "types-local";
    const typesLocalModuleDirPath = path.join(typesLocalDirName, moduleName);
    removeDirectory(typesLocalDirName, typesLocalModuleDirPath);
    removeModuleFromTsConfigJson(moduleName);
}
