import fs from "fs-extra";
import untildify from "untildify";
import bplist from "bplist-parser";
import semver from "semver";

/**
 * Check if file exists
 */
export function fileExists(file: string): boolean {
    try {
        fs.statSync(untildify(file));
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Resolve alfred prefrerences file path
 */
export function resolveAlfredPrefs(version: string | semver.SemVer): string | null {
    if (typeof version === "string") {
        version = semver.coerce(version);
    }

    let plistPath = untildify("~/Library/Preferences/com.runningwithcrayons.Alfred-Preferences.plist");
    let settingsPath = untildify("~/Library/Application Support/Alfred");

    if ((fileExists(plistPath) === false && version !== null) || version.major <= 3) {
        plistPath = untildify(`~/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-${version.major}.plist`);
        settingsPath = untildify(`~/Library/Application Support/Alfred ${version.major}`);

        if (fileExists(plistPath) === false) {
            throw new Error(`Alfred preferences not found at location ${plistPath}`);
        }
    }

    // Read settings file
    const data = bplist.parseBuffer(fs.readFileSync(plistPath));

    if (data && data[0] && data[0].syncfolder) {
        settingsPath = untildify(data[0].syncfolder);
    }

    return `${settingsPath}/Alfred.alfredpreferences`;
}
