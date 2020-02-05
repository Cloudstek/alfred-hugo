#!/usr/bin/env node
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import plist from 'plist';
import semver from 'semver';
import readPkg from 'read-pkg-up';
import del from 'del';
import utils from '../utils';

if (process.getuid && process.getuid() === 0) {
    console.error('You cannot run hugo-link as root.');
    process.exit(1);
}

// Get alfred ersion
const apps = glob.sync('/Applications/Alfred?( )+([0-9]).app');

for (const app of apps) {
    const plistPath = path.join(app, 'Contents', 'Info.plist');

    if (!utils.fileExists(plistPath)) {
        continue;
    }

    try {
        const appInfo = plist.parse(fs.readFileSync(plistPath, { encoding: 'utf8' }));
        const version = appInfo.CFBundleShortVersionString;

        if (!version || !semver.valid(semver.coerce(version))) {
            continue;
        }

        const prefsDir = utils.resolveAlfredPrefs(version);
        const workflowsDir = path.join(prefsDir, 'workflows');

        // Read package.json
        readPkg()
            .then(({ packageJson: pkg, path: pkgPath }) => {
                const src = path.dirname(pkgPath);
                const dest = path.join(workflowsDir, pkg.name.replace('/', '-'));

                if (fs.pathExistsSync(dest)) {
                    const destStat = fs.lstatSync(dest);

                    // Skip link creation if destination is a directory, not a symlink
                    if (destStat.isDirectory()) {
                        console.debug('Destination is a directory, skipping.');
                        return;
                    }

                    // Skip if destination exists but is not a directory or symlink
                    if (destStat.isSymbolicLink() === false) {
                        console.debug('Desination exists but is neither a directory or symlink, skipping.');
                        return;
                    }

                    // Skip link creation if already linked
                    if (fs.realpathSync(dest) === src) {
                        console.debug('Link already exists, skipping.');
                        return;
                    }

                    // Remove existing symlink
                    del.sync(dest, { force: true });
                }

                // Create symlink
                fs.ensureSymlink(src, dest);
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        continue;
    }
}
