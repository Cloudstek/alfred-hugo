declare module 'bplist-parser' {
    function parseFile(fileNameOrBuffer: string | Buffer, callback?: (error: Error, result: any) => void): any;
    function parseBuffer(buffer: Buffer): any;
}

declare module 'bplist-creator' {
    export default function(dicts: any): Buffer;
}
