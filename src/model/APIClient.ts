export type APIConfig<T = unknown> = Partial<CallbackConfig> & FetchConfig;

/**
 *
 */
type FetchConfig = {
    responseType?: string;
    /**
     * Timeout in seconds. Must be greater than 5, or else will be ignored.
     */
    timeout?: number;
    /**
     * Abort signal in this object will be ignored if 'timeout' is defined
     */
    requestInit?: RequestInit;
};

type CallbackConfig<T = unknown> = {
    onReturn: (response: T) => void;
    onError: (err: Error) => void;
};

/**
 * An API strategy is a set of predefined instructions to handle api fetches of various operations
 *
 * **Good practice to separation of underlying api and model logic from app logic.**
 */
export type ApiStrategy = {
    /**
     * Predefined url to the api
     */
    url?: string | URL;
    /**
     * Wrap a layer of predefined, shared logic around complete callback to
     * perform operation on data *(eg, transformation or registration)* before
     * returning it to complete callback
     * @param onComplete
     * @returns
     */
    onCompleteWrap?: (
        onComplete?: (response: never) => void
    ) => (response: never) => void;
    /**
     * Wrap a layer of predefined, shared logic around error callback to
     * perform operation on or with error *(eg, send to cloud analytics)* before
     * returning it to error callback
     * @param onComplete
     * @returns
     */
    onErrorWrap?: (onError?: (error: Error) => void) => (error: Error) => void;
} & FetchConfig;

/**
 * Group strategies together by a self-defined name
 */
const apiStrategyStore: Record<string, ApiStrategy> = Object.create(
    null
) as Record<string, ApiStrategy>;

function send<T>(request: URL | string, config: APIConfig<T>) {
    const { responseType, onReturn, onError, timeout, requestInit } = config;
    const init = { ...requestInit };
    let cancelTimeout: number | NodeJS.Timeout | undefined;
    let abort: AbortController | undefined;
    if (timeout && timeout > 5) {
        abort = new AbortController();
        init.signal = abort.signal;
        cancelTimeout = setTimeout(() => {
            abort?.abort();
        }, timeout);
    }
    fetch(request, init)
        .then((response) => {
            cancelTimeout !== undefined && clearTimeout(cancelTimeout);
            return handleResponse(response, responseType);
        })
        .then((responseData) => {
            onReturn && onReturn(responseData as T);
        })
        .catch((error: Error) => {
            cancelTimeout !== undefined && clearTimeout(cancelTimeout);
            onError && onError(error);
        });
}

function sendAsync<T>(request: URL | string, config: APIConfig<T>) {
    return new Promise((resolve, reject) => {
        const { responseType, timeout, requestInit } = config;
        const init = { ...requestInit };
        let cancelTimeout: number | NodeJS.Timeout | undefined;
        let abort: AbortController | undefined;
        if (timeout && timeout > 5) {
            abort = new AbortController();
            init.signal = abort.signal;
            cancelTimeout = setTimeout(() => {
                abort?.abort();
            }, timeout);
        }
        fetch(request, init)
            .then((response) => {
                cancelTimeout !== undefined && clearTimeout(cancelTimeout);
                return handleResponse(response, responseType);
            })
            .then((responseData) => {
                resolve(responseData as T);
            })
            .catch((error: Error) => {
                cancelTimeout !== undefined && clearTimeout(cancelTimeout);
                reject(error);
            });
    });
}

function handleResponse<T>(response: Response, type?: string): Promise<T> | T {
    switch (type) {
        case "json": {
            return response.json() as Promise<T>;
        }
        case "blob": {
            return response.blob() as Promise<T>;
        }
        case "arraybuffer": {
            return response.arrayBuffer() as Promise<T>;
        }
        default: {
            return response as T;
        }
    }
}

function registerApiStrategy(
    apiName: string,
    strategy: ApiStrategy,
    replace = false
) {
    if (
        !Object.prototype.hasOwnProperty.apply(apiStrategyStore, [apiName]) ||
        replace
    ) {
        apiStrategyStore[apiName] = strategy;
    } else {
        throw new Error(`Error code 2000. 1: ${apiName}`);
    }
}

function unregisterApiStrategy(apiName: string) {
    if (Object.prototype.hasOwnProperty.apply(apiStrategyStore, [apiName])) {
        delete apiStrategyStore[apiName];
    }
}

/**
 *
 * @param apiName Self defined name
 * @param onComplete
 * @param onError
 * @param urlReplace Replaces the predefined url. For eg, predefined url was `api.xxx-prod.com/...`, replacement url can be `api.xxx-dev.com/...`
 */
function sendRegisteredApi(
    apiName: string,
    onComplete?: (value: never) => void,
    onError?: (error: Error) => void,
    urlReplace?: string
) {
    if (!Object.prototype.hasOwnProperty.apply(apiStrategyStore, [apiName])) {
        throw new Error(`Error code 2001. 1: ${apiName}`);
    }
    const {
        url,
        onCompleteWrap,
        onErrorWrap,
        responseType,
        timeout,
        requestInit,
    } = apiStrategyStore[apiName];
    const realUrl = url || urlReplace;
    if (!realUrl) {
        throw new Error(`Error code 2002. 1: ${apiName}`);
    }
    send(realUrl, {
        onReturn: onCompleteWrap ? onCompleteWrap(onComplete) : onComplete,
        onError: onErrorWrap ? onErrorWrap(onError) : onError,
        responseType,
        timeout,
        requestInit,
    } as APIConfig<never>);
}

const APIClient = {
    send,
    sendAsync,
    registerApiStrategy,
    unregisterApiStrategy,
    sendRegisteredApi,
};
export default APIClient;
