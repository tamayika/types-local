import * as detectIndent from "detect-indent";
import * as dtsGen from "dts-gen";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as rimraf from "rimraf";
import * as sortKeys from "sort-keys";
import * as logger from "./logger";
import { Setting } from "./setting";

function prepareDirectory(typesLocalDirName: string, typesLocalModuleDirPath: string) {
    if (!fs.existsSync(typesLocalDirName)) {
        mkdirp.sync(typesLocalDirName);
    }
    if (!fs.existsSync(typesLocalModuleDirPath)) {
        mkdirp.sync(typesLocalModuleDirPath);
    }
}

function removeDirectory(typesLocalDirName: string, typesLocalModuleDirPath: string) {
    if (fs.existsSync(typesLocalModuleDirPath)) {
        rimraf.sync(typesLocalModuleDirPath);
    }
    try {
        fs.rmdirSync(typesLocalDirName);
        logger.info(`${typesLocalDirName} dir removed successfully.`);
    } catch (e) {
        logger.dump(`${typesLocalDirName} is not empty.`);
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
                logger.error(e);
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
    const tsConfigPath = "tsconfig.json";
    if (!fs.existsSync(tsConfigPath)) {
        logger.warn("tsconfig.json does not exist.");
        return;
    }
    const jsonContent = fs.readFileSync(tsConfigPath).toString();
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
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, indentAmount));
}

function addModuleToTsConfigJson(moduleName: string, typesLocalDirName: string) {
    // add baseUrl=.
    // add paths[${moduleName}]=[typesLocalDirName/${moduleName}]
    updateTsConfigJson((paths) => {
        paths[moduleName] = [`${typesLocalDirName}/${moduleName}`];
    });
}

function removeModuleFromTsConfigJson(moduleName: string) {
    // remove paths[${moduleName}]=[types-local/${moduleName}]
    updateTsConfigJson((paths) => {
        delete paths[moduleName];
    });
}

export function createTypesLocalPackage(moduleName: string, setting: Setting) {
    try {
        const module = requireModule(moduleName) || require(moduleName);
        const result = dtsGen.generateModuleDeclarationFile(moduleName, module);

        const typesLocalModuleDirPath = path.join(setting.installDir, moduleName);

        const moduleVersion = getModuleVersion(moduleName);
        prepareDirectory(setting.installDir, typesLocalModuleDirPath);
        writePackageJson(moduleName, moduleVersion, typesLocalModuleDirPath);
        writeDts(typesLocalModuleDirPath, result);
        addModuleToTsConfigJson(moduleName, setting.installDir);
        logger.info(`${moduleName} installed.`);
    } catch (e) {
        logger.error(`${moduleName} installation failed.`);
        logger.error(e);
    }
}

export function createTypesLocalPackages(moduleNames: string[], setting: Setting) {
    for (const moduleName of moduleNames) {
        createTypesLocalPackage(moduleName, setting);
    }
}

export function removeTypesLocalPackage(moduleName: string, setting: Setting) {
    try {
        const typesLocalModuleDirPath = path.join(setting.installDir, moduleName);
        removeDirectory(setting.installDir, typesLocalModuleDirPath);
        removeModuleFromTsConfigJson(moduleName);
        logger.info(`${moduleName} uninstalled.`);
    } catch (e) {
        logger.error(`${moduleName} uninstallation failed.`);
        logger.error(e);
    }
}

export function removeTypesLocalPackages(moduleNames: string[], setting: Setting) {
    for (const moduleName of moduleNames) {
        removeTypesLocalPackage(moduleName, setting);
    }
}
