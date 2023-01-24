
(function () {
    'use strict';


    function setupDetails(action, id, params) {
      
        const wrapAsyncSendMessage = action =>
            `(async function () {
    const result = { asyncFuncID: '${id}' };
    try {
        result.content = await (${action})(${params.map(p => JSON.stringify(p)).join(',')});
    }
    catch(x) {
        // Make an explicit copy of the Error properties
        result.error = { 
            message: x.message, 
            arguments: x.arguments, 
            type: x.type, 
            name: x.name, 
            stack: x.stack 
        };
    }
    finally {
        // Always call sendMessage, as without it this might loop forever
        chrome.runtime.sendMessage(result);
    }
})()`;

        let execArgs = {};
        if (typeof action === 'function' || typeof action === 'string')
            execArgs.code = wrapAsyncSendMessage(action);
        else if (action.code) {
            execArgs = action;
            execArgs.code = wrapAsyncSendMessage(action.code);
        }
        else if (action.file)
            throw new Error(`Cannot execute ${action.file}. File based execute scripts are not supported.`);
        else
            throw new Error(`Cannot execute ${JSON.stringify(action)}, it must be a function, string, or have a code property.`);

        return execArgs;
    }

    function promisifyRuntimeMessage(id) {
        return new Promise(resolve => {
            const listener = request => {
                if (request && request.asyncFuncID === id) {

                    chrome.runtime.onMessage.removeListener(listener);
                    resolve(request);
                }

                return false;
            };

            chrome.runtime.onMessage.addListener(listener);
        });
    }

     
    function promisifyTabUpdate(id, msTimeout) {

        let mainPromise = new Promise((resolve, reject) => {
            const tabUpdatedListener = (tabId, changeInfo, tab) => {
                
                if (tabId === id && changeInfo.status === 'complete') {
                    removeListeners();
                    resolve({tabId:tabId, changeInfo:changeInfo, tab:tab});
                }
            };

            const tabRemovedListener = (tabId, removeInfo) => {
                if (tabId === id) {
                    removeListeners();
                    reject(new Error(`The tab with id = ${tabId} was removed before it finished loading.`));
                }
            }

            const tabReplacedListener = (addedTabId, removedTabId) => {
                if (removedTabId === id) {
                    removeListeners();
                    reject(new Error(`The tab with id = ${removedTabId} was replaced before it finished loading.`));
                }
            }

            const removeListeners = () => {
                chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
                chrome.tabs.onRemoved.removeListener(tabRemovedListener);
                chrome.tabs.onReplaced.removeListener(tabReplacedListener);
            }

            chrome.tabs.onUpdated.addListener(tabUpdatedListener);
            chrome.tabs.onRemoved.addListener(tabRemovedListener);
            chrome.tabs.onReplaced.addListener(tabReplacedListener);
        });

        let timeoutPromise = new Promise ( (resolve, reject) => {
            let millisecondsToTimeout = 12e4; // 12e4 = 2 minutes
            if (!!msTimeout && typeof msTimeout === 'number' && msTimeout > 0) {
                millisecondsToTimeout = msTimeout;
            }
            setTimeout(() => {
                reject(new Error(`The tab loading timed out after ${millisecondsToTimeout/1000} seconds.`));
            }, millisecondsToTimeout);
        });

        return Promise.race([mainPromise, timeoutPromise]);
    }

   
    chrome.tabs.executeAsyncFunction = async function (tab, action, ...params) {

        const id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

        const details = setupDetails(action, id, params);

        const message = promisifyRuntimeMessage(id);

        await chrome.tabs.executeScript(tab, details);

        const { content, error } = await message;

        if (error)
            throw new Error(`Error thrown in execution script: ${error.message}.
Stack: ${error.stack}`)

        return content;
    }

  
    chrome.tabs.createAndWait = async function(createProperties, msTimeout) {
        const tab = await chrome.tabs.create(createProperties);
        const tabLoadCompletePromise = promisifyTabUpdate(tab.id, msTimeout);
        const results = await tabLoadCompletePromise;
        return results;
    }


    chrome.tabs.reloadAndWait = async function(tabId, reloadProperties, msTimeout) {
        await chrome.tabs.reload(tabId, reloadProperties);
        const tabLoadCompletePromise = promisifyTabUpdate(tabId, msTimeout);
        const results = await tabLoadCompletePromise;
        return results;
    }

})();
