'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CacheConf = require('cache-conf');
var moment = require('moment');
var readPkg = require('read-pkg');
var latestVersion = require('latest-version');
var got = require('got');

var Updater = function () {
    function Updater() {
        (0, _classCallCheck3.default)(this, Updater);

        this.cache = new CacheConf({
            configName: 'updater',
            cwd: process.env.alfred_workflow_cache,
            version: process.env.alfred_workflow_version
        });
    }

    (0, _createClass3.default)(Updater, [{
        key: 'checkPackal',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(interval) {
                var bundleId, searchParam, pkgUrl, latest;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                bundleId = process.env.alfred_workflow_bundleid;

                                if (bundleId) {
                                    _context.next = 4;
                                    break;
                                }

                                console.error('No bundle ID, not checking Packal for updates.');
                                return _context.abrupt('return');

                            case 4:
                                searchParam = encodeURIComponent('site:packal.org ' + bundleId);
                                pkgUrl = `https://encrypted.google.com/search?sourceid=chrome&ie=UTF-8&q=${searchParam}&btnI`;
                                _context.next = 8;
                                return got(`https://github.com/packal/repository/blob/master/${bundleId}/appcast.xml`).catch(function (err) {
                                    console.error(err);
                                    return false;
                                }).then(function (response) {
                                    var versionMatches = response.body.match(/<version>(.+)<\/version>/);

                                    if (versionMatches && versionMatches.length > 0) {
                                        return {
                                            version: response.body.match(/<version>(.+)<\/version>/)[1],
                                            url: pkgUrl,
                                            checkedOnline: false
                                        };
                                    }

                                    return false;
                                });

                            case 8:
                                latest = _context.sent;

                                this.cache.set('latest_version_packal', latest, {
                                    maxAge: interval.as('milliseconds')
                                });

                                if (latest) {
                                    latest.checkedOnline = true;
                                }

                                return _context.abrupt('return', latest);

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function checkPackal(_x) {
                return _ref.apply(this, arguments);
            }

            return checkPackal;
        }()
    }, {
        key: 'checkNpm',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(interval) {
                var pkg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                var url, latest;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.t0 = pkg;

                                if (_context2.t0) {
                                    _context2.next = 5;
                                    break;
                                }

                                _context2.next = 4;
                                return readPkg(process.cwd());

                            case 4:
                                _context2.t0 = _context2.sent;

                            case 5:
                                pkg = _context2.t0;
                                url = `https://www.npmjs.com/package/${pkg.name}`;
                                _context2.next = 9;
                                return latestVersion(pkg.name).catch(function (err) {
                                    console.error(err);
                                    return false;
                                }).then(function (version) {
                                    return {
                                        version: version,
                                        url: url,
                                        checkedOnline: false
                                    };
                                });

                            case 9:
                                latest = _context2.sent;

                                this.cache.set('latest_version_npm', latest, {
                                    maxAge: interval.as('milliseconds')
                                });

                                if (latest) {
                                    latest.checkedOnline = true;
                                }

                                return _context2.abrupt('return', latest);

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function checkNpm(_x3) {
                return _ref2.apply(this, arguments);
            }

            return checkNpm;
        }()
    }, {
        key: 'checkUpdates',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(source, interval) {
                var pkg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var latest;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                latest = this.cache.get(`latest_version_${source}`);

                                if (!(latest === false)) {
                                    _context3.next = 3;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 3:
                                if (latest) {
                                    _context3.next = 10;
                                    break;
                                }

                                _context3.t0 = source.toLowerCase();
                                _context3.next = _context3.t0 === 'npm' ? 7 : _context3.t0 === 'packal' ? 8 : 9;
                                break;

                            case 7:
                                return _context3.abrupt('return', this.checkNpm(interval, pkg));

                            case 8:
                                return _context3.abrupt('return', this.checkPackal(interval));

                            case 9:
                                return _context3.abrupt('return');

                            case 10:
                                latest.checkedOnline = false;

                                return _context3.abrupt('return', latest);

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function checkUpdates(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return checkUpdates;
        }()
    }]);
    return Updater;
}();

module.exports = new Updater();