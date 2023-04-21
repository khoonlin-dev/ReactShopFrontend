import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
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
    const responses = await Promise.all([
        APIClient.sendAsync(API + "/search/get", { responseType: "json" }),
        APIClient.sendAsync(API + "/search/get-option", {
            responseType: "json",
        }),
    ]);

    return {
        products: (responses[0] || []) as ProductInfo[],
        searchOption: (responses[1] || {}) as SearchOptions,
    };
});

export const getOrder = createAsyncThunk("shop/getOrder", async () => {
    const responses = await APIClient.sendAsync(API + "/order/get", {
        responseType: "json",
    });

    return responses as Order[];
});

export const searchProduct = createAsyncThunk(
    "shop/search",
    async (queries: Partial<SearchQuery>) => {
        const url = new URL(API + "/search/get");
        Object.entries(queries).forEach(([key, value]) => {
            if (value && value !== "") url.searchParams.append(key, value);
        });
        const responses = await APIClient.sendAsync(url, {
            responseType: "json",
        });
        return responses as ProductInfo[];
    }
);

export const placeOrder = createAsyncThunk(
    "shop/placeOrder",
    async (productId: string) => {
        const responses = await APIClient.sendAsync(API + "/order/create", {
            requestInit: {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            },
        }).catch((e) => {
            throw e;
        });
        return responses;
    }
);

export const completeOrder = createAsyncThunk(
    "shop/completeOrder",
    async (orderId: string) => {
        const responses = await APIClient.sendAsync(API + "/order/complete", {
            requestInit: {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId }),
            },
        })
            .then(() =>
                APIClient.sendAsync(API + "/order/get", {
                    responseType: "json",
                })
            )
            .catch((e) => {
                throw e;
            });
        return responses as Order[];
        //return responses as ProductInfo[];
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
            .addCase(placeOrder.fulfilled, (state) => {
                state.status = "idle";
            })
            .addCase(placeOrder.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(completeOrder.pending, (state) => {
                state.status = "waiting";
            })
            .addCase(completeOrder.fulfilled, (state, action) => {
                state.orders = action.payload;
                state.status = "idle";
            })
            .addCase(completeOrder.rejected, (state) => {
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
