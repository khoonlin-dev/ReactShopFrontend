import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { ShopAppState, Order, SearchQuery } from "./state";
import APIClient from "../model/APIClient";
import { ProductInfo } from "./state";
import { SearchOptions } from "./state";

const API = "http://localhost:3000";

const initialState: ShopAppState = {
    orders: [],
    products: [],
    searchOption: {},
    status: "waiting",
};

export const getInfo = createAsyncThunk("shop/getInfo", async () => {
    const [[productBody], [searchBody]] = await Promise.all([
        APIClient.sendAsync(API + "/search/get", { responseType: "json" }),
        APIClient.sendAsync(API + "/search/get-option", {
            responseType: "json",
        }),
    ]);

    return {
        products: (productBody || []) as ProductInfo[],
        searchOption: (searchBody || {}) as SearchOptions,
    };
});

export const getOrder = createAsyncThunk("shop/getOrder", async () => {
    const [body] = await APIClient.sendAsync(API + "/order/get", {
        responseType: "json",
    });

    return body as Order[];
});

export const searchProduct = createAsyncThunk(
    "shop/search",
    async (queries: Partial<SearchQuery>) => {
        const url = new URL(API + "/search/get");
        Object.entries(queries).forEach(([key, value]) => {
            if (value && value !== "") url.searchParams.append(key, value);
        });
        const [body] = await APIClient.sendAsync(url, {
            responseType: "json",
        });
        return body as ProductInfo[];
    }
);

export const placeOrder = createAsyncThunk(
    "shop/placeOrder",
    async (productId: number, { rejectWithValue }) => {
        const [body, response] = await APIClient.sendAsync<{
            outOfStock?: boolean;
            errorId?: number;
        }>(API + "/order/create", {
            responseType: "json",
            requestInit: {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            },
        });
        if (response.ok) {
            return {
                productId: productId,
                // In the future we might only pass-back out of stock boolean when it happens
                outOfStock: body.outOfStock || false,
            };
        } else if (body.outOfStock !== undefined && productId !== undefined) {
            // Set product to 'out of stock'
            return rejectWithValue({
                productId: productId,
                outOfStock: body.outOfStock,
            });
        } else if (body.errorId) {
            // Remove product from list
            return rejectWithValue({ errorId: body.errorId });
        } else {
            throw new Error(response.statusText);
        }
    }
);

export const completeOrder = createAsyncThunk(
    "shop/completeOrder",
    async (orderId: number, { rejectWithValue }) => {
        const [body, response] = await APIClient.sendAsync<{
            status?: string;
            errorId?: number;
        }>(API + "/order/complete", {
            responseType: "json",
            requestInit: {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId }),
            },
        });
        if (response.ok) {
            if (body.status) {
                return { orderId: orderId, status: body.status };
            }
            throw new Error(
                "Response is completed but latest order status code is not returned"
            );
        } else if (body.status !== undefined) {
            // Set order to whatever state it is right now
            return rejectWithValue({
                productId: orderId,
                status: body.status,
            });
        } else if (body.errorId) {
            // Remove order from list
            return rejectWithValue({ errorId: body.errorId });
        } else {
            throw new Error(response.statusText);
        }
    }
);

export const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getInfo.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(getInfo.fulfilled, (state, action) => {
                state.products = action.payload.products;
                state.searchOption = action.payload.searchOption;
                state.status = "idle";
            })
            .addCase(getInfo.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(getOrder.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(getOrder.fulfilled, (state, action) => {
                // TODO should it be done here or at server??
                // Process the orders time to local time zone...
                const { payload } = action;
                payload.forEach((order, i, arr) => {
                    const { dateAdded } = order;
                    const date = new Date(dateAdded);
                    arr[i].dateAdded = date.toLocaleString();
                });
                state.orders = action.payload;
                state.status = "idle";
            })
            .addCase(getOrder.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(searchProduct.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(searchProduct.fulfilled, (state, action) => {
                state.products = action.payload;
                state.status = "idle";
            })
            .addCase(searchProduct.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(placeOrder.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                const { outOfStock, productId } = action.payload;
                if (outOfStock) {
                    const product = state.products.find(
                        (product) => product.id === productId
                    );
                    product && (product.outOfStock = outOfStock);
                }
                state.status = "idle";
            })
            .addCase(placeOrder.rejected, (state, action) => {
                if (action.payload) {
                    const { outOfStock, errorId, productId } =
                        action.payload as {
                            outOfStock?: boolean;
                            productId?: number;
                            errorId?: number;
                            error?: Error;
                        };
                    if (outOfStock && productId !== undefined) {
                        const product = state.products.find(
                            (product) => product.id === productId
                        );

                        product && (product.outOfStock = outOfStock);
                    } else if (errorId !== undefined) {
                        const index = state.products.findIndex(
                            (product) => product.id === errorId
                        );
                        index > 0 && state.products.splice(index, 1);
                    }
                } else {
                    // Unhandled error (API error, network error, etc.)
                    // Find more about the error in action.error
                }
                state.status = "failed";
            })
            .addCase(completeOrder.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(completeOrder.fulfilled, (state, action) => {
                const { status, orderId } = action.payload;
                const order = state.orders.find(
                    (order) => order.id === orderId
                );

                order && (order.status = status);
                state.status = "idle";
            })
            .addCase(completeOrder.rejected, (state, action) => {
                if (action.payload) {
                    const { status, errorId, orderId } = action.payload as {
                        status?: string;
                        orderId?: number;
                        errorId?: number;
                    };
                    if (status && orderId !== undefined) {
                        const order = state.orders.find(
                            (order) => order.id === orderId
                        );
                        order && (order.status = status);
                    } else if (errorId !== undefined) {
                        const index = state.orders.findIndex(
                            (order) => order.id === errorId
                        );
                        index > 0 && state.orders.splice(index, 1);
                    }
                } else {
                    // Unhandled error (API error, network error, etc.)
                    // Find more about the error in action.error
                }
                state.status = "failed";
            });
    },
});

export const selectShopStatus = (state: RootState) => state.shop.status;
export const selectProductGroup = (state: RootState) => state.shop.products;
export const selectSearchOption = (state: RootState) => state.shop.searchOption;
export const selectBrowseInfo = (state: RootState) => {
    return {
        products: state.shop.products,
        searchOption: state.shop.searchOption,
    };
};
export const selectOrderInfo = (state: RootState) => {
    return state.shop.orders;
};
export default shopSlice.reducer;
