import "mocha";
import "chai";
import { expect } from "chai";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import * as rimraf from "rimraf";
import * as TypesLocal from "../lib/index";

describe("TypesLocal", () => {
    function sharedExample(dependencies: string[], done: () => void) {
        rimraf.sync(path.join("types-local", "mkdirp"));
        TypesLocal.createTypesLocalPackage("mkdirp", dependencies, false, () => {
            const dir = (path.join("types-local", "mkdirp"));
            expect(fs.existsSync(dir)).to.be.true;
            expect(fs.existsSync(path.join(dir, "index.d.ts")));
            const packageJson = JSON.parse(fs.readFileSync(path.join(dir, "package.json")).toString());
            expect(packageJson["name"]).to.eq("@types/mkdirp");
            const dep = {};
            for (const dependency of dependencies) {
                dep[`@types/${dependency}`] = "*";
            }
            expect(packageJson["dependencies"]).to.eql(dep);
            expect(packageJson["typings"]).to.eq("index.d.ts");
            expect(packageJson["version"]).to.not.undefined;
            expect(packageJson["description"]).to.not.undefined;
            rimraf.sync(dir);
            done();
        });
    }

    context("no dependencies", () => {
        it("createTypesLocalPackage", (done) => {
            sharedExample([], done);
        });
    });

    context("no dependencies", () => {
        it("createTypesLocalPackage", (done) => {
            sharedExample(["rimraf"], done);
        });
    });
});
