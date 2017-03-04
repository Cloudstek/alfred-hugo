
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Conf = require('conf');
var CacheConf = require('cache-conf');
var moment = require('moment');
var readPkg = require('read-pkg');
var latestVersion = require('latest-version');
var semver = require('semver');
var notifier = require('node-notifier');
var path = require('path');
var got = require('got');
var Fuse = require('fuse.js');

var Hugo = function () {
    function Hugo() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Hugo);

        this._outputBuffer = {};

        this.options = Object.assign({}, options, {
            checkUpdates: false,
            updateInterval: 86400,
            updateNotification: true,
            updateItem: false
        });

        this.config = new Conf({
            cwd: Hugo.workflowMeta.data
        });

        this.cache = new CacheConf({
            configName: 'cache',
            cwd: Hugo.workflowMeta.cache,
            version: Hugo.workflowMeta.version
        });

        this.checkUpdates();
    }

    _createClass(Hugo, [{
        key: 'addItem',
        value: function addItem(item) {
            if (!this._outputBuffer.items) {
                this._outputBuffer.items = [];
            }

            if (item.arg && typeof item.arg === 'object') {
                var arg = item.arg.arg;
                var variables = item.arg.variables;

                item.arg = JSON.stringify({
                    alfredworkflow: {
                        arg: arg,
                        variables: variables
                    }
                });
            }

            this._outputBuffer.items.push(item);
        }
    }, {
        key: 'addItems',
        value: function addItems(items) {
            var _this = this;

            if (!this._outputBuffer.items) {
                this._outputBuffer.items = [];
            }

            items.map(function (item) {
                _this.addItem(item);
                return item;
            });
        }
    }, {
        key: 'addVariable',
        value: function addVariable(key, value) {
            if (!this._outputBuffer.variables) {
                this._outputBuffer.variables = {};
            }

            this._outputBuffer.variables[key] = value;
        }
    }, {
        key: 'addVariables',
        value: function addVariables(variables) {
            if (!this._outputBuffer.variables) {
                this._outputBuffer.variables = variables;
                return;
            }

            this._outputBuffer.variables = Object.assign({}, this._outputBuffer.variables, variables);
        }
    }, {
        key: 'action',
        value: function action(keyword, callback) {
            var query = process.argv[2];

            if (query && callback && query === keyword) {
                var _query = process.argv[3] || '';
                callback(_query);
            }

            return this;
        }
    }, {
        key: 'checkUpdates',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                var lastUpdate, nextUpdate, pkg, wfName, wfIcon, latest;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                lastUpdate = moment(this.config.get('hugo_last_update'), 'X') || moment();
                                nextUpdate = lastUpdate.add(this.options.updateInterval, 's');
                                _context.next = 4;
                                return readPkg(process.cwd());

                            case 4:
                                pkg = _context.sent;
                                wfName = process.env.alfred_workflow_name || '';
                                wfIcon = Hugo.workflowMeta.icon || '';
                                latest = this.cache.get('hugo_latest_version');

                                if (!(this.options.updateItem === false && this.options.updateNotification === false)) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 10:
                                if (!(moment().isSameOrAfter(nextUpdate, 'second') || !latest)) {
                                    _context.next = 15;
                                    break;
                                }

                                _context.next = 13;
                                return latestVersion(pkg.name);

                            case 13:
                                latest = _context.sent;

                                this.config.set('hugo_last_update', moment().format('X'));

                            case 15:
                                if (semver.gt(latest, pkg.version)) {
                                    if (this.options.updateNotification === true) {
                                        notifier.notify({
                                            title: `${wfName} workflow update available!`,
                                            message: `Version ${latest} is available. Run 'npm install -g ${pkg.name}' to update.`,
                                            icon: wfIcon
                                        });
                                    } else if (this.options.updateItem === true) {
                                        this.addItem({
                                            title: `${wfName} workflow update available!`,
                                            subtitle: `Version ${latest} is available. Run 'npm install -g ${pkg.name}' to update.`,
                                            icon: wfIcon
                                        });
                                    }
                                }

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function checkUpdates() {
                return _ref.apply(this, arguments);
            }

            return checkUpdates;
        }()
    }, {
        key: 'matches',
        value: function matches(input) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            options = Object.assign({}, {
                keys: ['title']
            }, options);

            var fuse = new Fuse(this._outputBuffer, options);

            return fuse.search(input) || [];
        }
    }, {
        key: 'feedback',
        value: function feedback() {
            if (this._rerun) {
                this._outputBuffer.rerun = this._rerun;
            }

            console.log(JSON.stringify(this._outputBuffer, null, '\t'));

            this._outputBuffer = {};
        }
    }, {
        key: 'fetch',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(url, options) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                options = Object.assign({}, {
                                    json: true
                                }, options);

                                return _context2.abrupt('return', got(url, options).then(function (response) {
                                    return response.body;
                                }));

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function fetch(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return fetch;
        }()
    }, {
        key: 'rerun',
        get: function get() {
            return this._rerun;
        },
        set: function set(value) {
            value = parseFloat(value);

            if (value && value > 0.1 && value <= 5) {
                this._rerun = value;
            }
        }
    }], [{
        key: 'alfredMeta',
        get: function get() {
            return {
                version: process.env.alfred_version,
                theme: process.env.alfred_theme,
                themeBackground: process.env.alfred_theme_background,
                themeSelectionBackground: process.env.alfred_theme_selection_background,
                themeSubtext: parseFloat(process.env.alfred_theme_subtext),
                preferences: process.env.alfred_preferences,
                preferencesLocalHash: process.env.alfred_preferences_localhash
            };
        }
    }, {
        key: 'workflowMeta',
        get: function get() {
            return {
                name: process.env.alfred_workflow_name,
                version: process.env.alfred_workflow_version,
                uid: process.env.alfred_workflow_uid,
                bundleId: process.env.alfred_workflow_bundleid,
                data: process.env.alfred_workflow_data,
                cache: process.env.alfred_workflow_cache,
                icon: path.join(process.cwd(), 'icon.png')
            };
        }
    }]);

    return Hugo;
}();

module.exports = new Hugo();