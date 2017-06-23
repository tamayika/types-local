[![npm version](https://badge.fury.io/js/types-local.svg)](https://badge.fury.io/js/types-local)
[![CircleCI](https://circleci.com/gh/tamayika/types-local.svg?style=svg)](https://circleci.com/gh/tamayika/types-local)

# types-local: A TypeScript Definition Helper for not type-defined package in DefinitelyTyped to use easily

`types-local` is a tool that generates TypeScript definition file (.d.ts) from node package.

`types-local` uses [dts-gen](https://github.com/Microsoft/dts-gen), generates module at `types-local/<module-name>` and install folder as package.

# Usage

```sh
> npm install -g types-local

# install not type-defined package
> npm install --save <module-name>, <module-name2>, ...
> types-local install <module-name>, <module-name2>, ...
```

This generates

```
.
+-- types-local
   +-- <module-name>
       +-- package.json
       +-- index.d.ts (type definition)
   +-- <module-name2>
       +-- package.json
       +-- index.d.ts (type definition)
   ...
```

And update tsconfig.json

```json
{
    "compilerOptions": {
        "baseUrl": ".", // if not exists
        "paths": { // add module path
            "${moduleName}": [
                "types-local/${moduleName}"
            ],
            "${moduleName2}": [
                "types-local/${moduleName2}"
            ],
            ...
        }
    }
}
```

```sh
# if you want to uninstall definition
> types-local uninstall <module-name>, <module-name2>, ...
```

will remove `types-local/<module-name>`, `types-local/<module-name2>`, ... and update `tsconfig.json`.

# Options

|shorthand |full       |description         |
|----------|-----------|--------------------|
|-v        |--version  |Show version        |
|-h        |--help     |Show help           |

# Module Resolution

Currently find `node_modules` directory from current directory to root directory.
If `node_modules/${moduleName}/package.json` is found, requires `node_modules/${moduleName}`.
If not found, `require(${moduleName})` calls.