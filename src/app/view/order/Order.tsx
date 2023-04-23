import { Alert, Button, Table } from "reactstrap";
import { completeOrder, selectOrderInfo } from "../../../state/shopSlice";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import { toast } from "react-toastify";

function titleCase(str: string) {
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

// TODO fix date locale display, should parse it to local time when response come back first

export default function Order({ disabled }: { disabled: boolean }) {
    const orders = useAppSelector(selectOrderInfo);
    const dispatch = useAppDispatch();

    if (orders.length > 0) {
        const tableHeaders = Object.keys(orders[0]);
        tableHeaders.push("Action");
        return (
            <Table responsive bordered striped>
                <thead>
                    <tr>
                        {tableHeaders.map((header) => {
                            // Process raw header key
                            let processedHeader = header;
                            // The 'id' stands for key of row in the table and should be returned
                            if (processedHeader.toLowerCase() === "id") {
                                processedHeader = "Order Id";
                            } else {
                                processedHeader = titleCase(processedHeader)
                                    .split(/(?=[A-Z])/)
                                    .join(" ");
                            }
                            return (
                                <th key={`table-header-${header}`}>
                                    {processedHeader}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => {
                        const id = order.id;
                        const rowKey = `table-row-order-id-${id}`;
                        return (
                            <tr key={rowKey}>
                                <>
                                    {Object.entries(order).map(
                                        ([key, value]) => {
                                            return (
                                                <td
                                                    key={`${rowKey}-action-${key}`}
                                                >
                                                    {value}
                                                </td>
                                            );
                                        }
                                    )}
                                    <td key={`${rowKey}-action`}>
                                        {order.status.toLowerCase() ===
                                        "opened" ? (
                                            <Button
                                                disabled={disabled}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toast
                                                        .promise(
                                                            dispatch(
                                                                completeOrder(
                                                                    order.id
                                                                )
                                                            ).then(
                                                                (response) => {
                                                                    /**
                                                                     * Redux rejection will not be caught here unless I explicitly throw it in the reducer, which is not good practice...
                                                                     *
                                                                     * Otherwise, can only access from error item in response object
                                                                     *
                                                                     * Here we must throw it to trigger error toast
                                                                     */
                                                                    const {
                                                                        //@ts-expect-error wrong type
                                                                        error,
                                                                    } =
                                                                        response;
                                                                    if (error) {
                                                                        throw error;
                                                                    }
                                                                }
                                                            ),
                                                            {
                                                                pending:
                                                                    "Loading",
                                                                success:
                                                                    "Order completed",
                                                                error: "Failed to complete order, it might be network error or order could be already completed, please try again",
                                                            }
                                                        )
                                                        .catch((/*e*/) => {
                                                            /*
                                                             * There's two ways to handle error:
                                                             * 1. Store it in redux and handle it using redux state (do nothing here)
                                                             * 2. Throw it to error boundary
                                                             */
                                                            // throw e;
                                                        });
                                                }}
                                            >
                                                Set Completed
                                            </Button>
                                        ) : undefined}
                                    </td>
                                </>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    } else {
        return (
            <div>
                <Alert color="secondary">Order not found</Alert>{" "}
                <Button
                    disabled={disabled}
                    onClick={(e) => {
                        e.preventDefault();
                        console.log(`Clicked on reload`);
                    }}
                >
                    Reload
                </Button>
            </div>
        );
    }
}
