import "chai";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as rimraf from "rimraf";
import * as TypesLocal from "../lib/index";
import { Setting } from "../lib/setting";
import * as util from "./util";

describe("Setting", () => {
    function withTempDir(callback: () => void) {
        const tempDir = util.createTempDir();
        process.chdir(tempDir);
        callback();
        rimraf.sync(tempDir);
    }

    describe("constructor", () => {
        it("not exist setting", () => {
            withTempDir(() => {
                const setting = new Setting();
                expect(setting.installDir).to.eq("types-local");
                expect(setting.initializeFailed).to.eq(false);
            });
        });

        it("correct setting", () => {
            withTempDir(() => {
                fs.writeFileSync("types-local.json", `{
                    "installDir": "lib/types"
                }`);
                const setting = new Setting();
                expect(setting.installDir).to.eq("lib/types");
                expect(setting.initializeFailed).to.eq(false);
            });
        });

        it("incorrect type setting", () => {
            withTempDir(() => {
                fs.writeFileSync("types-local.json", `{
                    "installDir": 1
                }`);
                const setting = new Setting();
                expect(setting.installDir).to.eq("types-local");
                expect(setting.initializeFailed).to.eq(false);
            });
        });

        it("invalid json setting", () => {
            withTempDir(() => {
                fs.writeFileSync("types-local.json", `{
                    "installDir: "lib/types"
                }`);
                const setting = new Setting();
                expect(setting.installDir).to.eq("types-local");
                expect(setting.initializeFailed).to.eq(true);
            });
        });
    });

    it("save", () => {
        withTempDir(() => {
            const setting = new Setting();
            setting.save();
            expect(fs.readFileSync("types-local.json"), `{
    "installDir": "types-local"
}`);
        });
    });
});
