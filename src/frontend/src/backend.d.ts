import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Coin {
    owner: Principal;
    metadata?: string;
    name: string;
    description: string;
    totalSupply: bigint;
    symbol: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface MarketCapTrendPoint {
    marketCap: bigint;
    timestamp: Time;
}
export interface Order {
    coinSymbol: string;
    side: OrderSide;
    user: Principal;
    orderId: bigint;
    timestamp: Time;
    quantity: bigint;
    price: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    displayName: string;
}
export enum OrderSide {
    buy = "buy",
    sell = "sell"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeWithdrawal(sessionId: string, amountCents: bigint): Promise<void>;
    createCallerUserProfile(profile: UserProfile): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createStripeSession(sessionId: string, amountCents: bigint): Promise<void>;
    finalizeDeposit(sessionId: string): Promise<void>;
    getBalance(symbol: string): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCreatorCapRanking(): Promise<Array<[Principal, bigint]>>;
    getCreatorCoinsWithMarketCaps(): Promise<Array<[Principal, Array<Coin>, bigint]>>;
    getMarketCapTrend(user: Principal): Promise<Array<MarketCapTrendPoint>>;
    getOrderBook(symbol: string, side: OrderSide, depth: bigint | null): Promise<Array<Order>>;
    getPublicUserProfile(user: Principal): Promise<UserProfile | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(symbol: string, side: OrderSide, price: number, quantity: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
