import "chai";
import { expect } from "chai";
import * as childProcess from "child_process";
import * as fs from "fs";
import "mocha";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import * as rimraf from "rimraf";
import * as TypesLocal from "../lib/index";

describe("TypesLocal", () => {
    function createTempDir() {
        const dirName = path.join(os.tmpdir(), (Math.random() * 12345).toString());
        fs.mkdirSync(dirName);
        return dirName;
    }

    function sharedExample(done: () => void) {
        const tempDir = createTempDir();
        process.chdir(tempDir);
        fs.writeFileSync("tsconfig.json", "{}");
        TypesLocal.createTypesLocalPackage("mkdirp", () => {
            const dir = (path.join("types-local", "mkdirp"));
            expect(fs.existsSync(dir)).to.be.true;
            expect(fs.existsSync(path.join(dir, "index.d.ts")));
            const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
            expect(packageJson.name).to.eq("@types/mkdirp");
            expect(packageJson.typings).to.eq("index.d.ts");
            expect(packageJson.version).to.not.undefined;
            expect(packageJson.description).to.not.undefined;
            rimraf.sync(dir);
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
            const tsConfig = JSON.parse(tsConfigJson);
            expect(tsConfig.compilerOptions.baseUrl).to.not.undefined;
            expect(tsConfig.compilerOptions.paths).to.not.undefined;
            expect(tsConfig.compilerOptions.paths.mkdirp).to.eql(["types-local/mkdirp"]);
            rimraf.sync(tempDir);
            done();
        });
    }

    context("no dependencies", () => {
        it("createTypesLocalPackage", (done) => {
            sharedExample(done);
        });
    });
});
