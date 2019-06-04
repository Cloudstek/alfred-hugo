import * as fs from "fs-extra";

/**
 * Check if file exists
 *
 * @param file
 */
export function fileExists(file: string): boolean {
    try {
        fs.statSync(file);
        return true;
    } catch (err) {
        return false;
    }
}
