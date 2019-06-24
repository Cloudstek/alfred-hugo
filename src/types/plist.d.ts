declare module "plist" {
    export function parse(string: string): any;
    export function build(json: any[]): string;
}
