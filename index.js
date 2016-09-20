#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var requireg = require('requireg');
var npm = requireg('npm');
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
    if (moduleDependencies) {
        var dependencies = info["dependencies"] = {}
        for (var moduleDependency of moduleDependencies) {
            dependencies[`@types/${moduleDependency}`] = "*";
        }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(info, null, 2));
}

function writeDts() {
    fs.writeFileSync(path.join(typesLocalmoduleDirPath, 'index.d.ts'), result);
}


var yargs = require('yargs')
    .usage('Usage: $0 <module-name> [options]')
    .alias('d', 'dependencies')
    .describe('d', 'module dependencies')
    .array('d')
    .help('h')
    .alias('h', 'help');
var argv = yargs.argv;

if (argv._.length == 0) {
    yargs.showHelp();
    return;
}

var moduleName = argv._[0];
var _module = require(moduleName);
var moduleVersion = '';
var result = dtsGen.generateModuleDeclarationFile(moduleName, _module);
var moduleDependencies = argv.d || [];

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