import "chai";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import * as rimraf from "rimraf";
import * as TypesLocal from "../lib/index";
import { Setting } from "../lib/setting";
import * as util from "./util";

describe("TypesLocal", () => {
    function install(packageNames: string[], installDir: string, callback: () => void) {
        const tempDir = util.createTempDir();
        process.chdir(tempDir);
        fs.writeFileSync("tsconfig.json", "{}");
        const setting = new Setting();
        setting.installDir = installDir;
        setting.save();
        TypesLocal.createTypesLocalPackages(packageNames, new Setting());
        callback();
        rimraf.sync(tempDir);
    }

    it("createTypesLocalPackage", () => {
        install(["mkdirp"], "types-local", () => {
            const dir = (path.join("types-local", "mkdirp"));
            expect(fs.existsSync(dir)).to.eq(true);
            expect(fs.existsSync(path.join(dir, "index.d.ts")));
            const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
            expect(packageJson.name).to.eq("@types/mkdirp");
            expect(packageJson.typings).to.eq("index.d.ts");
            expect(packageJson.version).to.not.eq(undefined);
            expect(packageJson.description).to.not.eq(undefined);
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "mkdirp": [
                "types-local/mkdirp"
            ]
        }
    }
}`);
        });
    });

    it("createTypesLocalPackage with changed installDir", () => {
        install(["mkdirp"], "lib/types", () => {
            const dir = (path.join("lib", "types", "mkdirp"));
            expect(fs.existsSync(dir)).to.eq(true);
            expect(fs.existsSync(path.join(dir, "index.d.ts")));
            const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
            expect(packageJson.name).to.eq("@types/mkdirp");
            expect(packageJson.typings).to.eq("index.d.ts");
            expect(packageJson.version).to.not.eq(undefined);
            expect(packageJson.description).to.not.eq(undefined);
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "mkdirp": [
                "lib/types/mkdirp"
            ]
        }
    }
}`);
        });
    });

    it("createTypesLocalPackages", () => {
        const packageNames = ["mkdirp", "diff"];
        install(packageNames, "types-local", () => {
            for (const packageName of packageNames) {
                const dir = (path.join("types-local", packageName));
                expect(fs.existsSync(dir)).to.eq(true);
                expect(fs.existsSync(path.join(dir, "index.d.ts")));
                const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
                expect(packageJson.name).to.eq(`@types/${packageName}`);
                expect(packageJson.typings).to.eq("index.d.ts");
                expect(packageJson.version).to.not.eq(undefined);
                expect(packageJson.description).to.not.eq(undefined);
            }
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "mkdirp": [
                "types-local/mkdirp"
            ],
            "diff": [
                "types-local/diff"
            ]
        }
    }
}`);
        });
    });

    it("createTypesLocalPackage with scoped package", () => {
        install(["@request/headers"], "types-local", () => {
            const dir = (path.join("types-local", "@request", "headers"));
            expect(fs.existsSync(dir)).to.eq(true);
            expect(fs.existsSync(path.join(dir, "index.d.ts")));
            const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
            expect(packageJson.name).to.eq("@types/@request/headers");
            expect(packageJson.typings).to.eq("index.d.ts");
            expect(packageJson.version).to.not.eq(undefined);
            expect(packageJson.description).to.not.eq(undefined);
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@request/headers": [
                "types-local/@request/headers"
            ]
        }
    }
}`);
        });
    });

    it("removeTypesLocalPackage", () => {
        install(["mkdirp"], "types-local", () => {
            TypesLocal.removeTypesLocalPackage("mkdirp", new Setting());
            const dir = (path.join("types-local", "mkdirp"));
            expect(fs.existsSync(dir)).to.be.eq(false);
            expect(fs.existsSync("types-local")).to.be.eq(false);
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {}
}`);
        });
    });

    it("removeTypesLocalPackage with changed installDir", () => {
        install(["mkdirp"], "lib/types", () => {
            TypesLocal.removeTypesLocalPackage("mkdirp", new Setting());
            const dir = (path.join("lib", "types", "mkdirp"));
            expect(fs.existsSync(dir)).to.be.eq(false);
            expect(fs.existsSync("lib/types")).to.be.eq(false);
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {}
}`);
        });
    });

    it("removeTypesLocalPackages", () => {
        const packageNames = ["mkdirp", "diff"];
        install(packageNames, "types-local", () => {
            TypesLocal.removeTypesLocalPackages(packageNames, new Setting());
            for (const packageName of packageNames) {
                const dir = (path.join("types-local", packageName));
                expect(fs.existsSync(dir)).to.be.eq(false);
                expect(fs.existsSync("types-local")).to.be.eq(false);
            }
            const tsConfigJson = fs.readFileSync("tsconfig.json").toString();
            expect(tsConfigJson).to.eq(`{
    "compilerOptions": {}
}`);
        });
    });
});
