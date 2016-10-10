export = requireg;
declare function requireg(module: any): any;
declare namespace requireg {
    function globalize(): void;
    function resolve(module: any, dirname: any): any;
}
