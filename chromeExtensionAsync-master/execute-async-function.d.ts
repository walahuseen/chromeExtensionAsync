declare namespace chrome.tabs {

    interface InjectAsyncDetails {
        
        code: string;
    }


    export function executeAsyncFunction(tab: number, action: ((...p: any[]) => any) | string | InjectAsyncDetails, ...params: any[]): Promise<any>;

    export function createAndWait(createProperties: object, msTimeout: number): Promise<any>;

   
    export function reloadAndWait(tabId: number, reloadProperties: object, msTimeout: number): Promise<any>;
}