import test from 'ava';
import sinon from 'sinon';

import { hugo } from '../helpers/init';

const backupConsoleError = console.error;

test.serial('valid version', (t) => {
    const h = hugo();

    process.env.alfred_workflow_version = '3.0.0';

    // Check version number
    t.is(typeof h.workflowMeta, 'object');
    t.is(h.workflowMeta.version, '3.0.0');
});

test.serial('single digit version', (t) => {
    const h = hugo();

    process.env.alfred_workflow_version = '3';

    // Check version number
    t.is(typeof h.workflowMeta, 'object');
    t.is(h.workflowMeta.version, '3.0.0');
});

test.serial('two digit version', (t) => {
    const h = hugo();

    process.env.alfred_workflow_version = '3.0';

    // Check version number
    t.is(typeof h.workflowMeta, 'object');
    t.is(h.workflowMeta.version, '3.0.0');
});

test.serial('no version', (t) => {
    const consoleStub = sinon.stub(console, 'error');
    const h = hugo();

    process.env.alfred_debug = '0';
    delete process.env.alfred_workflow_version;

    // Check version number
    t.is(typeof h.workflowMeta, 'object');
    t.falsy(h.workflowMeta.version);
    t.false(consoleStub.called);

    // Check if debug message is output
    process.env.alfred_debug = '1';

    t.is(typeof h.workflowMeta, 'object');
    t.falsy(h.workflowMeta.version);
    t.true(consoleStub.calledWith(sinon.match('Invalid workflow version: undefined')));
});

test.serial('invalid version', (t) => {
    const consoleStub = sinon.stub(console, 'error');
    const h = hugo();

    process.env.alfred_debug = '0';
    process.env.alfred_workflow_version = 'foobar';

    // Check version number
    t.is(typeof h.workflowMeta, 'object');
    t.falsy(h.workflowMeta.version);
    t.false(consoleStub.called);

    // Check if debug message is output
    process.env.alfred_debug = '1';

    t.is(typeof h.workflowMeta, 'object');
    t.falsy(h.workflowMeta.version);
    t.true(consoleStub.calledWith(sinon.match('Invalid workflow version: foobar')));
});

test.afterEach.always(() => {
    console.error = backupConsoleError;
});
