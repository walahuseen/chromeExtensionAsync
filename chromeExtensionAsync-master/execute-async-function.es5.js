'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }


(function () {
    'use strict';

    
    function promisify(f, parseCB) {
        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var safeArgs = args;
            var callback = void 0;

            if (args && args.length > 0) {

                var last = args[args.length - 1];
                if (typeof last === 'function') {
                    safeArgs = args.slice(0, args.length - 1);
                    callback = last;
                }
            }

            return new Promise(function (resolve, reject) {
                try {
                    f.apply(undefined, _toConsumableArray(safeArgs).concat([function () {
                        for (var _len2 = arguments.length, cbArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            cbArgs[_key2] = arguments[_key2];
                        }

                        if (callback) {
                            try {
                                callback.apply(undefined, cbArgs);
                            } catch (cbErr) {
                                reject(cbErr);
                            }
                        }

                        if (chrome.runtime.lastError)
                            reject(new Error(chrome.runtime.lastError.message || 'Error thrown by API ' + chrome.runtime.lastError));else {
                            if (parseCB) {
                                var cbObj = parseCB.apply(undefined, cbArgs);
                                resolve(cbObj);
                            } else if (!cbArgs || cbArgs.length === 0) resolve();else if (cbArgs.length === 1) resolve(cbArgs[0]);else resolve(cbArgs);
                        }
                    }]));
                } catch (err) {
                    reject(err);
                }
            });
        };
    }

   
    function applyMap(api, apiMap) {
        if (!api)
            return;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = apiMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var funcDef = _step.value;

                var funcName = void 0;
                if (typeof funcDef === 'string') funcName = funcDef;else {
                    funcName = funcDef.n;
                }

                if (!api.hasOwnProperty(funcName))
                    continue;

                var m = api[funcName];
                if (typeof m === 'function')
                    api[funcName] = promisify(m, funcDef.cb);else
                    applyMap(m, funcDef.props);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    function applyMaps(apiMaps) {
        for (var apiName in apiMaps) {
            var callbackApi = chrome[apiName];
            if (!callbackApi)
                continue;

            var apiMap = apiMaps[apiName];
            applyMap(callbackApi, apiMap);
        }
    }

    var knownA11ySetting = ['get', 'set', 'clear'];

    var knownInContentSetting = ['clear', 'get', 'set', 'getResourceIdentifiers'];

    var knownInStorageArea = ['get', 'getBytesInUse', 'set', 'remove', 'clear'];

    applyMaps({
        accessibilityFeatures: [
        { n: 'spokenFeedback', props: knownA11ySetting }, { n: 'largeCursor', props: knownA11ySetting }, { n: 'stickyKeys', props: knownA11ySetting }, { n: 'highContrast', props: knownA11ySetting }, { n: 'screenMagnifier', props: knownA11ySetting }, { n: 'autoclick', props: knownA11ySetting }, { n: 'virtualKeyboard', props: knownA11ySetting }, { n: 'animationPolicy', props: knownA11ySetting }],
        alarms: ['get', 'getAll', 'clear', 'clearAll'],
        bookmarks: ['get', 'getChildren', 'getRecent', 'getTree', 'getSubTree', 'search', 'create', 'move', 'update', 'remove', 'removeTree'],
        browser: ['openTab'],
        browserAction: ['getTitle', 'setIcon', 'getPopup', 'getBadgeText', 'getBadgeBackgroundColor'],
        browsingData: ['settings', 'remove', 'removeAppcache', 'removeCache', 'removeCookies', 'removeDownloads', 'removeFileSystems', 'removeFormData', 'removeHistory', 'removeIndexedDB', 'removeLocalStorage', 'removePluginData', 'removePasswords', 'removeWebSQL'],
        commands: ['getAll'],
        contentSettings: [
        { n: 'cookies', props: knownInContentSetting }, { n: 'images', props: knownInContentSetting }, { n: 'javascript', props: knownInContentSetting }, { n: 'location', props: knownInContentSetting }, { n: 'plugins', props: knownInContentSetting }, { n: 'popups', props: knownInContentSetting }, { n: 'notifications', props: knownInContentSetting }, { n: 'fullscreen', props: knownInContentSetting }, { n: 'mouselock', props: knownInContentSetting }, { n: 'microphone', props: knownInContentSetting }, { n: 'camera', props: knownInContentSetting }, { n: 'unsandboxedPlugins', props: knownInContentSetting }, { n: 'automaticDownloads', props: knownInContentSetting }],
        contextMenus: ['create', 'update', 'remove', 'removeAll'],
        cookies: ['get', 'getAll', 'set', 'remove', 'getAllCookieStores'],
        debugger: ['attach', 'detach', 'sendCommand', 'getTargets'],
        desktopCapture: ['chooseDesktopMedia'],
        documentScan: ['scan'],
        downloads: ['download', 'search', 'pause', 'resume', 'cancel', 'getFileIcon', 'erase', 'removeFile', 'acceptDanger'],
        enterprise: [{ n: 'platformKeys', props: ['getToken', 'getCertificates', 'importCertificate', 'removeCertificate'] }],
        extension: ['isAllowedIncognitoAccess', 'isAllowedFileSchemeAccess'],
        fileBrowserHandler: ['selectFile'],
        fileSystemProvider: ['mount', 'unmount', 'getAll', 'get', 'notify'],
        fontSettings: ['setDefaultFontSize', 'getFont', 'getDefaultFontSize', 'getMinimumFontSize', 'setMinimumFontSize', 'getDefaultFixedFontSize', 'clearDefaultFontSize', 'setDefaultFixedFontSize', 'clearFont', 'setFont', 'clearMinimumFontSize', 'getFontList', 'clearDefaultFixedFontSize'],
        gcm: ['register', 'unregister', 'send'],
        history: ['search', 'getVisits', 'addUrl', 'deleteUrl', 'deleteRange', 'deleteAll'],
        i18n: ['getAcceptLanguages', 'detectLanguage'],
        identity: ['getAuthToken', 'getProfileUserInfo', 'removeCachedAuthToken', 'launchWebAuthFlow', 'getRedirectURL'],
        idle: ['queryState'],
        input: [{
            n: 'ime', props: ['setMenuItems', 'commitText', 'setCandidates', 'setComposition', 'updateMenuItems', 'setCandidateWindowProperties', 'clearComposition', 'setCursorPosition', 'sendKeyEvents', 'deleteSurroundingText']
        }],
        management: ['setEnabled', 'getPermissionWarningsById', 'get', 'getAll', 'getPermissionWarningsByManifest', 'launchApp', 'uninstall', 'getSelf', 'uninstallSelf', 'createAppShortcut', 'setLaunchType', 'generateAppForLink'],
        networking: [{ n: 'config', props: ['setNetworkFilter', 'finishAuthentication'] }],
        notifications: ['create', 'update', 'clear', 'getAll', 'getPermissionLevel'],
        pageAction: ['getTitle', 'setIcon', 'getPopup'],
        pageCapture: ['saveAsMHTML'],
        permissions: ['getAll', 'contains', 'request', 'remove'],
        platformKeys: ['selectClientCertificates', 'verifyTLSServerCertificate', { n: "getKeyPair", cb: function cb(publicKey, privateKey) {
                return { publicKey: publicKey, privateKey: privateKey };
            } }],
        runtime: ['getBackgroundPage', 'openOptionsPage', 'setUninstallURL', 'restartAfterDelay', 'sendMessage', 'sendNativeMessage', 'getPlatformInfo', 'getPackageDirectoryEntry', { n: "requestUpdateCheck", cb: function cb(status, details) {
                return { status: status, details: details };
            } }],
        scriptBadge: ['getPopup'],
        sessions: ['getRecentlyClosed', 'getDevices', 'restore'],
        storage: [
        { n: 'sync', props: knownInStorageArea }, { n: 'local', props: knownInStorageArea }, { n: 'managed', props: knownInStorageArea }],
        socket: ['create', 'connect', 'bind', 'read', 'write', 'recvFrom', 'sendTo', 'listen', 'accept', 'setKeepAlive', 'setNoDelay', 'getInfo', 'getNetworkList'],
        sockets: [{ n: 'tcp', props: ['create', 'update', 'setPaused', 'setKeepAlive', 'setNoDelay', 'connect', 'disconnect', 'secure', 'send', 'close', 'getInfo', 'getSockets'] }, { n: 'tcpServer', props: ['create', 'update', 'setPaused', 'listen', 'disconnect', 'close', 'getInfo', 'getSockets'] }, { n: 'udp', props: ['create', 'update', 'setPaused', 'bind', 'send', 'close', 'getInfo', 'getSockets', 'joinGroup', 'leaveGroup', 'setMulticastTimeToLive', 'setMulticastLoopbackMode', 'getJoinedGroups', 'setBroadcast'] }],
        system: [{ n: 'cpu', props: ['getInfo'] }, { n: 'memory', props: ['getInfo'] }, { n: 'storage', props: ['getInfo', 'ejectDevice', 'getAvailableCapacity'] }],
        tabCapture: ['capture', 'getCapturedTabs'],
        tabs: ['get', 'getCurrent', 'sendMessage', 'create', 'duplicate', 'query', 'highlight', 'update', 'move', 'reload', 'remove', 'detectLanguage', 'captureVisibleTab', 'executeScript', 'insertCSS', 'setZoom', 'getZoom', 'setZoomSettings', 'getZoomSettings', 'discard'],
        topSites: ['get'],
        tts: ['isSpeaking', 'getVoices', 'speak'],
        types: ['set', 'get', 'clear'],
        vpnProvider: ['createConfig', 'destroyConfig', 'setParameters', 'sendPacket', 'notifyConnectionStateChanged'],
        wallpaper: ['setWallpaper'],
        webNavigation: ['getFrame', 'getAllFrames', 'handlerBehaviorChanged'],
        windows: ['get', 'getCurrent', 'getLastFocused', 'getAll', 'create', 'update', 'remove']
    });
})();
