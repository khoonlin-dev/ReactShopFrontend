export interface ProductInfo {
    id: number;
    modelName: string;
    brandName: string;
    categoryName: string;
    brandId: number;
    colorName: string;
    imgSrc: string;
    price: string;
    outOfStock: boolean;
}

export interface SearchQuery {
    colorName: string;
    brandId: string;
    categoryId: string;
    modelName: string;
}

export interface SearchOptions {
    color: Record<string, string>;
    brand: Record<string, string>;
    category: Record<string, string>;
}

export interface Order {
    id: number;
    productId: number;
    modelName: string;
    colorName: string;
    dateAdded: string;
    status: string;
}

export interface ShopAppState {
    products: ProductInfo[];
    searchOption: Partial<SearchOptions>;
    orders: Order[];
    status: "idle" | "waiting" | "failed";
}
