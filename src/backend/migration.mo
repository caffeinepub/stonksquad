import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Original types from previous version
  type OrderSide = { #buy; #sell };
  type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
  };
  type Coin = {
    owner : Principal;
    symbol : Text;
    name : Text;
    description : Text;
    totalSupply : Nat;
    metadata : ?Text;
  };
  type Balance = {
    var amount : Nat;
  };
  type Order = {
    orderId : Nat;
    user : Principal;
    coinSymbol : Text;
    side : OrderSide;
    price : Float;
    quantity : Nat;
    timestamp : Time.Time;
  };
  type StripeStatus = { #pending; #completed; #failed };
  type StripeSession = {
    user : Principal;
    status : StripeStatus;
    amountCents : Nat;
  };
  type MarketCapTrendPoint = {
    timestamp : Time.Time;
    marketCap : Nat;
  };

  type OldActor = {
    coins : Map.Map<Text, Coin>;
    users : Map.Map<Principal, UserProfile>;
    sqdBalances : Map.Map<Principal, Balance>;
    coinBalances : Map.Map<Principal, Map.Map<Text, Balance>>;
    orders : Map.Map<Nat, Order>;
    usdcBalances : Map.Map<Principal, Balance>;
    marketCapTrends : Map.Map<Principal, List.List<MarketCapTrendPoint>>;
    stripeSessions : Map.Map<Text, StripeSession>;
    nextOrderId : Nat;
  };

  // New actor with price history
  type PricePoint = {
    timestamp : Time.Time;
    price : Float;
  };
  type NewActor = {
    coins : Map.Map<Text, Coin>;
    users : Map.Map<Principal, UserProfile>;
    sqdBalances : Map.Map<Principal, Balance>;
    coinBalances : Map.Map<Principal, Map.Map<Text, Balance>>;
    orders : Map.Map<Nat, Order>;
    usdcBalances : Map.Map<Principal, Balance>;
    marketCapTrends : Map.Map<Principal, List.List<MarketCapTrendPoint>>;
    stripeSessions : Map.Map<Text, StripeSession>;
    nextOrderId : Nat;
    priceHistory : Map.Map<Text, List.List<PricePoint>>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let emptyPriceHistory = Map.empty<Text, List.List<PricePoint>>();
    { old with priceHistory = emptyPriceHistory };
  };
};
