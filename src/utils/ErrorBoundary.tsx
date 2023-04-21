import React from "react";

type onError = (error: Error, info?: React.ErrorInfo) => void;

const changedArray = (a: Array<unknown> = [], b: Array<unknown> = []) =>
    a.length !== b.length ||
    a.some((item, index) => !Object.is(item, b[index]));

interface FallbackProps {
    error: Error;
    onReset: (...args: Array<unknown>) => void;
}

declare function onError(error: Error, info?: React.ErrorInfo): void;

declare function fallbackRender(
    props: FallbackProps
): React.ReactElement<
    unknown,
    string | React.FunctionComponent | typeof React.Component
> | null;

interface ErrorBoundaryProps {
    onResetKeysChange?: (
        prevResetKeys: Array<unknown> | undefined,
        resetKeys: Array<unknown> | undefined
    ) => void;
    onReset?: (...args: Array<unknown>) => void;
    onError?: typeof onError;
    resetKeys?: Array<unknown>;
    fallbackRender: typeof fallbackRender;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * **Stateless** (pure) error boundary which only purpose is to **emit error** thrown by child components without rendering fallbacks
 */
export class PureErrorBoundary<
    P extends { onError?: typeof onError },
    S
> extends React.Component<React.PropsWithRef<React.PropsWithChildren<P>>, S> {
    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        this.props.onError?.(error, info);
        /*
         *  Unfortunate hack to suppress this dumb React bug:
                Warning: PureErrorBoundary: Error boundaries should implement getDerivedStateFromError(). 
                In that method, return a state update to display an error message or fallback UI.
            See more: https://github.com/reactjs/reactjs.org/issues/3028
         */
        this.setState(null);
    }

    render() {
        return this.props.children;
    }
}

/**
 * **Stateful** error boundary that handles not only error thrown by child components but also **rendering fallback**
 */
export class ErrorBoundary extends PureErrorBoundary<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    //state = initialState;
    resetErrorBoundary = (...args: Array<unknown>) => {
        this.props.onReset?.(...args);
        this.reset();
    };

    reset() {
        this.setState({ error: null });
    }

    componentDidUpdate(
        prevProps: ErrorBoundaryProps,
        prevState: ErrorBoundaryState
    ) {
        const { error } = this.state;
        const { resetKeys } = this.props;

        // There's an edge case where if the thing that triggered the error
        // happens to *also* be in the resetKeys array, we'd end up resetting
        // the error boundary immediately. This would likely trigger a second
        // error to be thrown.
        // So we make sure that we don't check the resetKeys on the first call
        // of cDU after the error is set

        if (
            error !== null &&
            prevState.error !== null &&
            changedArray(prevProps.resetKeys, resetKeys)
        ) {
            this.props.onResetKeysChange?.(prevProps.resetKeys, resetKeys);
            this.reset();
        }
    }

    render() {
        const { error } = this.state;

        const { fallbackRender } = this.props;

        if (error !== null) {
            const props = {
                error,
                onReset: this.resetErrorBoundary,
            };
            return fallbackRender(props);
        }

        return this.props.children;
    }
}
