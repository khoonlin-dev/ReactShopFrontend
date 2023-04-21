import "./ErrorView.css";
export default function ErrorView(props: {
    error: Error;
    fallback?: { action: () => void; buttonText?: string };
}) {
    return (
        <div role="alert" className="error-view">
            <p>Something went wrong:</p>
            <pre>{props.error.message}</pre>
            {props.fallback ? (
                <button onClick={props.fallback.action}>
                    {props.fallback.buttonText || "Return"}
                </button>
            ) : undefined}
        </div>
    );
}
