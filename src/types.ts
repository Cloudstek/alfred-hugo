import { Duration } from "moment";
import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { Cache } from "@cloudstek/cache";

export enum IconType {
    fileIcon = "fileicon",
    fileType = "filetype",
}

export enum ItemType {
    default = "default",
    file = "file",
    fileSkipCheck = "file:skipcheck",
}

export enum UpdateSource {
    NPM = "npm" as any,
    Packal = "packal" as any,
}

export interface HugoOptions {
    checkUpdates?: boolean;
    updateSource?: UpdateSource | string;
    updateInterval?: number | Duration;
    updateNotification?: boolean;
    updateItem?: boolean;
}

export interface WorkflowMeta {
    name?: string;
    version?: string;
    uid?: string;
    bundleId?: string;
    data?: string;
    cache?: string;
    icon: string;
}

export interface AlfredMeta {
    version?: string;
    theme?: string;
    themeFile?: string;
    themeBackground?: string;
    themeSelectionBackground?: string;
    themeSubtext?: number;
    preferences?: string;
    preferencesLocalHash?: string;
    debug: boolean;
}

export interface FilterResults {
    rerun?: number;
    variables?: { [key: string]: any };
    items: Item[];
}

export interface Item {
    uid?: string;
    title: string;
    subtitle?: string;
    arg?: string;
    icon?: ItemIcon;
    valid?: boolean;
    match?: string;
    autocomplete?: string;
    type?: ItemType;
    mods?: ItemModifiers;
    text?: ItemText;
    quicklookurl?: string;
    variables?: { [key: string]: any };
}

export interface ItemIcon {
    type?: IconType;
    path: string;
}

export interface ItemModifiers {
    alt?: ItemModifier;
    ctrl?: ItemModifier;
    cmd?: ItemModifier;
    fn?: ItemModifier;
    shift?: ItemModifier;
}

export interface ItemModifier {
    valid: boolean;
    subtitle: string;
    arg: string;
    variables?: { [key: string]: any };
}

export interface ItemText {
    copy?: string;
    largetype?: string;
}

export interface LatestVersion {
    version: string;
    url: string;
    checkedOnline: boolean;
}

export interface FileCacheEvents {
    change: (cache: Cache, file: string) => void;
}

export type FileCacheEventEmitter = StrictEventEmitter<EventEmitter, FileCacheEvents>;
