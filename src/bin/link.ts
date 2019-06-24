#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import glob from "glob";
import plist from "plist";
import semver from "semver";
import readPkg from "read-pkg-up";
import del from "del";
import * as utils from "../utils";

if (process.getuid && process.getuid() === 0) {
    console.error("You cannot run hugo-link as root.");
    process.exit(1);
}

// Get alfred ersion
const apps = glob.sync("/Applications/Alfred?( )+([0-9]).app");

for (const app of apps) {
    const plistPath = path.join(app, "Contents", "Info.plist");

    if (!utils.fileExists(plistPath)) {
        continue;
    }

    try {
        const appInfo = plist.parse(fs.readFileSync(plistPath, { encoding: "utf8" }));
        const version = appInfo.CFBundleShortVersionString;

        if (!version || !semver.valid(semver.coerce(version))) {
            continue;
        }

        const prefsDir = utils.resolveAlfredPrefs(version);
        const workflowsDir = path.join(prefsDir, "workflows");

        // Read package.json
        readPkg()
            .then(({ package: pkg, path: pkgPath }) => {
                const src = path.dirname(pkgPath);
                const dest = path.join(workflowsDir, pkg.name.replace("/", "-"));

                del(dest, { force: true }).then(() => {
                    fs.ensureSymlink(src, dest);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        continue;
    }
}
