import { Hugo, Item } from '../../src';

export interface TestContext {
    hugo?: Hugo;
    url?: string;
    urlHash?: string;
    items?: Item[];
}
