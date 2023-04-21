/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FormEvent, useState } from "react";
import {
    Alert,
    Button,
    Pagination,
    PaginationItem,
    PaginationLink,
} from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import {
    placeOrder,
    searchProduct,
    selectBrowseInfo,
} from "../../../state/shopSlice";

import "../../style/browse/Browse.scss";
import ProductCard from "./Product";
import Search from "./Search";

// TODO improve layout, try use grid

export default function Browse({ disabled }: { disabled: boolean }) {
    const { products, searchOption } = useAppSelector(selectBrowseInfo);
    const dispatch = useAppDispatch();
    const [{ pageSize, currentPage }, setPageInfo] = useState({
        pageSize: 8,
        currentPage: 0,
    });

    const pagesCount = Math.ceil(products.length / pageSize) || 1;

    function handleClick(
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        index: number
    ) {
        if (!disabled) {
            e.preventDefault();
            setPageInfo({ currentPage: index, pageSize });
        }
    }

    return (
        <div className="browse-container">
            <Search
                disabled={disabled}
                searchOptions={searchOption}
                onSubmit={function (e: FormEvent<HTMLFormElement>) {
                    e.preventDefault();
                    const data = new FormData(e.target as HTMLFormElement);
                    // Color need to be value
                    const colorCode = data.get("color");
                    const colorName =
                        colorCode && searchOption.color
                            ? searchOption.color[colorCode as string]
                            : "";
                    dispatch(
                        searchProduct({
                            colorName: colorName,
                            categoryId: data.get("category") as string,
                            brandId: data.get("brand") as string,
                            modelName: data.get("model") as string,
                        })
                    ).catch((e) => {
                        throw e;
                    });
                }}
            />
            <div className="browse-body">
                {products.length > 0 ? (
                    <>
                        <div className="browse-page">
                            {products
                                .slice(
                                    currentPage * pageSize,
                                    (currentPage + 1) * pageSize
                                )
                                .map((info, i) => (
                                    <ProductCard
                                        key={`product-${info.modelName}-${info.brandName}-${info.colorName}-${i}`}
                                        product={info}
                                        disabled={disabled || info.outOfStock}
                                        onPlaceOrder={function () {
                                            dispatch(placeOrder(`${info.id}`))
                                                .then((res) => {
                                                    //@ts-expect-error wrong typings in dispatch
                                                    if (res.error) {
                                                        alert(
                                                            "Failed to place order, it might be out of stock. Please refresh"
                                                        );
                                                    } else {
                                                        alert("Order placed.");
                                                    }
                                                })
                                                .catch((e) => {
                                                    throw e;
                                                });
                                        }}
                                    />
                                ))}
                        </div>
                        <div className="pagination-wrapper">
                            <Pagination aria-label="Page navigation example">
                                <PaginationItem
                                    disabled={disabled || currentPage <= 0}
                                >
                                    <PaginationLink
                                        onClick={(e) =>
                                            handleClick(e, currentPage - 1)
                                        }
                                        previous
                                        href="#"
                                    />
                                </PaginationItem>

                                {[...Array<number>(pagesCount)].map(
                                    (page, i) => (
                                        <PaginationItem
                                            active={i === currentPage}
                                            key={i}
                                        >
                                            <PaginationLink
                                                onClick={(e) =>
                                                    handleClick(e, i)
                                                }
                                                href="#"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                <PaginationItem
                                    disabled={
                                        disabled ||
                                        currentPage >= pagesCount - 1
                                    }
                                >
                                    <PaginationLink
                                        onClick={(e) =>
                                            handleClick(e, currentPage + 1)
                                        }
                                        next
                                        href="#"
                                    />
                                </PaginationItem>
                            </Pagination>
                        </div>
                    </>
                ) : (
                    <div>
                        <Alert color="secondary">
                            Products not found. Try change the search query.
                        </Alert>
                    </div>
                )}
            </div>
        </div>
    );
}
