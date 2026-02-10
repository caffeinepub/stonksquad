import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Order {
    coinSymbol: string;
    side: OrderSide;
    user: Principal;
    orderId: bigint;
    timestamp: Time;
    quantity: bigint;
    price: number;
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
    createCallerUserProfile(profile: UserProfile): Promise<void>;
    getBalance(symbol: string): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderBook(symbol: string, side: OrderSide, depth: bigint | null): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(symbol: string, side: OrderSide, price: number, quantity: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
