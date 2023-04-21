import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App";
import { store } from "./state/store";
import { PureErrorBoundary } from "./utils/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Provider store={store}>
        <PureErrorBoundary
            onError={(_e: Error) => {
                // No time to complete due to time restriction, but I put it here just to demo (because I wrote this PureErrorBoundary component)
                // Insert your favorite external error handler here such as Google Analytics
            }}
        >
            <App />
        </PureErrorBoundary>
    </Provider>
);
