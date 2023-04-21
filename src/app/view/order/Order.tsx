import { Alert, Button, Table } from "reactstrap";
import { completeOrder, selectOrderInfo } from "../../../state/shopSlice";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";

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
                                                    dispatch(
                                                        completeOrder(
                                                            `${order.id}`
                                                        )
                                                    )
                                                        .then((res) => {
                                                            //@ts-expect-error wrong type
                                                            if (res.error) {
                                                                alert(
                                                                    "Failed to complete order. Order might have already completed, please refresh"
                                                                );
                                                            } else {
                                                                alert(
                                                                    "Order completed"
                                                                );
                                                            }
                                                        })
                                                        .catch((e) => {
                                                            throw e;
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
