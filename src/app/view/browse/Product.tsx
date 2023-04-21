import { Button, Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import { ProductInfo } from "../../../state/state";

export default function ProductCard({
    onPlaceOrder,
    product,
    disabled,
}: {
    onPlaceOrder: () => void;
    product: ProductInfo;
    disabled: boolean;
}) {
    const { modelName, colorName, price, imgSrc, brandName, outOfStock } =
        product;
    return (
        <Card
            style={{
                width: "16rem",
                minWidth: "15rem",
                height: "20rem",
            }}
        >
            <img
                alt={`${brandName} ${modelName} (${colorName})`}
                src={imgSrc}
                width={"100%"}
                height={"100%"}
                style={{ objectFit: "contain", overflow: "hidden" }}
            />
            <CardBody>
                <CardTitle tag="h5">{`${modelName} (${colorName})`}</CardTitle>
                <CardSubtitle className="mb-2 text-muted" tag="h6">
                    {`RM ${price}`}
                </CardSubtitle>
                <Button
                    disabled={disabled}
                    onClick={() => {
                        if (!outOfStock) {
                            onPlaceOrder();
                        }
                    }}
                >
                    {outOfStock ? "Out of Stock" : "Place Order"}
                </Button>
            </CardBody>
        </Card>
    );
}
