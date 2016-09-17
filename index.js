#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var npm = require('npm');
var process = require('process');
var dtsGen = require('dts-gen');

function prepareDirectory() {
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

function writePackageJson() {
    var jsonPath = path.join(typesLocalmoduleDirPath, 'package.json');
    var info = {
        name: '@types/' + moduleName,
        typings: 'index.d.ts',
        version: moduleVersion,
        description: 'TypeScript definitions for ' + moduleName + ' ' + moduleVersion,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
}

function writeDts() {
    fs.writeFileSync(path.join(typesLocalmoduleDirPath, 'index.d.ts'), result);
}

if (process.argv.length < 3) {
    console.log("Usage: types-local <module-name>");
    return;
}

var moduleName = process.argv[2];
var _module = require(moduleName);
var moduleVersion = '';
var result = dtsGen.generateModuleDeclarationFile(moduleName, _module);

var typesLocalDirName = 'types-local';
var typesLocalmoduleDirPath = path.join(typesLocalDirName, moduleName);

npm.load({ save: true }, function (err) {
    if (err) {
        console.error(err);
        return;
    }
    npm.commands.info([moduleName], true, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        moduleVersion = Object.keys(data)[0];
        prepareDirectory();
        writePackageJson();
        writeDts();
        npm.commands.install([typesLocalmoduleDirPath]);
    });
});