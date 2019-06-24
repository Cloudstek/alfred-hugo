import { Cache } from "@cloudstek/cache";
import crypto from "crypto";
import path from "path";
import moment from "moment";
import fs from "fs-extra";
import nock from "nock";
import sinon from "sinon";

import { Updater, Hugo, HugoOptions } from "../../src";

export function setAlfredEnv() {
    process.env.alfred_version = "4.0.0";
    process.env.alfred_workflow_version = "1.0.0";
    process.env.alfred_workflow_bundleid = "my.work.flow";
    process.env.alfred_preferences = path.join("build", "cache", crypto.randomBytes(8).toString("hex"));
    process.env.alfred_workflow_data = path.join("build", "cache", crypto.randomBytes(8).toString("hex"));
    process.env.alfred_workflow_cache = path.join("build", "cache", crypto.randomBytes(8).toString("hex"));
    process.env.alfred_debug = "0";

    fs.ensureDirSync(process.env.alfred_preferences);
    fs.ensureDirSync(process.env.alfred_workflow_data);
    fs.ensureDirSync(process.env.alfred_workflow_cache);

    // Set up fake home dir
    process.env.HOME = path.join("build", "cache", crypto.randomBytes(8).toString("hex"));
}

export function hugo(options?: HugoOptions) {
    setAlfredEnv();

    // Disable real HTTP requests with nock
    nock.disableNetConnect();

    if (!options) {
        options = {
            checkUpdates: false,
        };
    }

    // Init hugo
    const h = new Hugo(options);

    // Init another Hugo that has no stubs and stuff
    const originalHugo = new Hugo(options);

    sinon.stub(h, "workflowMeta").get(() => {
        const workflowMeta = originalHugo.workflowMeta;

        // Give workflow icon a fixed path
        workflowMeta.icon = "/foo/bar/icon.png";

        return workflowMeta;
    });

    return h;
}

export function updater(cacheTtl?: number | moment.Duration) {
    setAlfredEnv();

    // Disable real HTTP requests with nock
    nock.disableNetConnect();

    const cache = new Cache({
        dir: process.env.alfred_workflow_cache,
    });

    return new Updater(cache, cacheTtl || moment.duration(1, "hour"));
}
