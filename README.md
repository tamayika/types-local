# types-local: A TypeScript Definition Helper for not type-defined package in DefinitelyTyped to use easily

`types-local` is a tool that generates TypeScript definition file (.d.ts) from node package.

`types-local` uses [dts-gen][https://github.com/Microsoft/dts-gen], generates module at `types-local/<module-name>` and install folder as package.

# Usage

```sh
> npm install --save types-local

# install not type-defined package
> npm install --save <module-name>
> types-local <module-name>
```

This generates

```
.
+-- types-local
   +-- <module-name>
       +-- package.json
       +-- index.d.ts (type definition)
```