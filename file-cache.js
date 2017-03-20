'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var EventEmitter = require('events').EventEmitter;

var FileCacheStore = function () {
    function FileCacheStore() {
        (0, _classCallCheck3.default)(this, FileCacheStore);

        this._contents = {};
    }

    (0, _createClass3.default)(FileCacheStore, [{
        key: 'store',
        value: function store(value) {
            this._contents = value;
            return this;
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            this._contents[key] = value;
            return this;
        }
    }, {
        key: 'contents',
        get: function get() {
            return this._contents;
        }
    }]);
    return FileCacheStore;
}();

var FileCache = function (_EventEmitter) {
    (0, _inherits3.default)(FileCache, _EventEmitter);

    function FileCache(filePath, cacheName, cacheDir) {
        (0, _classCallCheck3.default)(this, FileCache);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FileCache.__proto__ || (0, _getPrototypeOf2.default)(FileCache)).call(this));

        _this.filePath = filePath;
        _this.cacheName = cacheName;
        _this.cacheDir = cacheDir;
        return _this;
    }

    (0, _createClass3.default)(FileCache, [{
        key: '_fileExists',
        value: function _fileExists(path) {
            try {
                fs.statSync(path);
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: 'get',
        value: function get() {
            if (this._fileExists(this.filePath)) {
                var eventResult = new FileCacheStore();

                var file = fs.readFileSync(this.filePath, 'utf8');

                var hash = crypto.createHash('sha1').update(file, 'utf8').digest('hex');

                if (!this.cacheDir) {
                    console.log('No cache dir set');
                    this.emit('changed', eventResult, file, hash);
                    return eventResult.contents;
                }

                var cachePath = path.join(this.cacheDir, this.cacheName, hash);

                if (this._fileExists(cachePath)) {
                    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                }

                if (!this._fileExists(path.dirname(cachePath))) {
                    mkdirp.sync(path.dirname(cachePath));
                }

                this.emit('changed', eventResult, file, hash);

                fs.writeFileSync(cachePath, (0, _stringify2.default)(eventResult.contents));
                return eventResult.contents;
            }

            return null;
        }
    }]);
    return FileCache;
}(EventEmitter);

module.exports = FileCache;