import React from "react";

export function usePrevious<T>(value: T): T {
    const ref = React.useRef<T>();
    React.useEffect(() => {
        ref.current = value; //assign the value of ref to the argument
    }, [value]); //this code will run when the value of 'value' changes
    return ref.current as T; //in the end, return the current ref value.
}

export function useForceUpdate() {
    return React.useReducer((x: number) => x + 1, 0)[1];
}

/**
 * Use the returned callback on erroneous codes in a component where error boundary couldn't catch and throw the error as own error.
 *
 * (eg: event handlers, asynchronous code e.g. setTimeout or requestAnimationFrame callbacks, server side rendering or errors thrown in the error boundary itself rather than its children)
 *
 * Useful for letting the error boundary on the upper levels to handle these errors
 * @param givenError
 * @returns
 */
export function useErrorPropagator(givenError?: Error): (error: Error) => void {
    const [error, setError] = React.useState<Error | null>(null);
    if (givenError != null) throw givenError;
    if (error != null) throw error;
    return setError;
}

export function useErrorHandling<S>(props: {
    /**
     * We expect state will be ever-changing, because we expect this function to be called during re-render, aka "change of state"
     */
    state: S;
    onError: (error?: Error) => void;
    onFallback: (state: S, error?: Error) => void;
}): [
    React.MutableRefObject<Error | undefined>,
    () => void,
    (error: Error) => void,
    (error: Error) => void
] {
    const { state, onError, onFallback } = props;
    // Keep a list of previous state here for fallback when error happens in child component (which is after state update)
    const prevState = usePrevious(props.state);
    /**
     * Unfortunately, when an error occurs, with or without error boundary / componentDidCatch,
     * the parent component will be rendered TWICE. Causing 'prevState' to go through multiple render iterations
     * before fallback render. Hence a snapshot is needed to capture the final 'prevState' before the FIRST error
     */
    const fallbackState = React.useRef<S | undefined>();
    /**
     * Storing error in REF rather than STATE provides more flexibility to error handling approaches
     * since there isn't any error handling hook in functional components.
     * For example, catching error in child components doesn't neccessary have to rerender parent component,
     * we can leave it for error boundary to handle it for us.
     */
    const errRef = React.useRef<Error | undefined>();
    const handleError = (stateForFallback?: S) => {
        return (error: Error) => {
            if (!errRef.current) {
                errRef.current = error;
                fallbackState.current = stateForFallback;
                onError(error);
            }
        };
    };
    const doFallback = React.useCallback(() => {
        if (errRef.current && fallbackState.current) {
            const resetData = fallbackState.current;
            const error = errRef.current;
            errRef.current = undefined;
            fallbackState.current = undefined;
            onFallback(resetData, error);
        }
    }, [onFallback]);
    return [errRef, doFallback, handleError(state), handleError(prevState)];
}
