import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Extend access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types for persistent state
  type PrincipalType = Principal;

  type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
  };

  module User {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      Text.compare(user1.username, user2.username);
    };
  };

  type Coin = {
    owner : Principal;
    symbol : Text;
    name : Text;
    description : Text;
    totalSupply : Nat;
  };

  module Coins {
    public func compare(coin1 : Coin, coin2 : Coin) : Order.Order {
      Text.compare(coin1.symbol, coin2.symbol);
    };
  };

  type Balance = {
    var amount : Nat;
  };

  // Order status
  type OrderSide = {
    #buy;
    #sell;
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

  module Orders {
    public func compareByPrice(order1 : Order, order2 : Order) : Order.Order {
      Float.compare(order1.price, order2.price);
    };
  };

  // Persistent state
  let users = Map.empty<Principal, UserProfile>();
  let coins = Map.empty<Text, Coin>();
  let sqdBalances = Map.empty<Principal, Balance>(); // SQD balances
  let coinBalances = Map.empty<Principal, Map.Map<Text, ?Balance>>(); // User coin balances
  let orders = Map.empty<Nat, Order>();

  // Constants
  let INITIAL_SQD_AIRDROP = 1000;
  let INITIAL_COIN_SUPPLY = 10000;
  let DEFAULT_ORDER_BOOK_DEPTH = 10;

  // Helper Functions
  func getOrCreateCoin(caller : Principal) : Coin {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile must exist to create coin") };
      case (?profile) {
        let symbol = profile.username;
        switch (coins.get(symbol)) {
          case (null) {
            let coin : Coin = {
              owner = caller;
              symbol;
              name = profile.displayName.concat(" Asset");
              description = profile.bio.concat(" - Showing my greatest creative passion");
              totalSupply = INITIAL_COIN_SUPPLY;
            };
            coins.add(symbol, coin);
            coin;
          };
          case (?existingCoin) { existingCoin };
        };
      };
    };
  };

  func getUserCoinBalance(user : Principal, symbol : Text) : Nat {
    switch (coinBalances.get(user)) {
      case (null) { 0 };
      case (?userCoinBalances) {
        switch (userCoinBalances.get(symbol)) {
          case (null) { 0 };
          case (?coinBalance) {
            switch (coinBalance) {
              case (null) { 0 };
              case (?validBalance) { validBalance.amount };
            };
          };
        };
      };
    };
  };

  func getUserSqdBalance(user : Principal) : Nat {
    switch (sqdBalances.get(user)) {
      case (null) { 0 };
      case (?balance) { balance.amount };
    };
  };

  // Core Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Allow any caller (including guests) to check if they have a profile
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Public read access - anyone can view user profiles (market data)
    users.get(user);
  };

  public shared ({ caller }) func createCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };
    if (profile.username.isEmpty() or profile.displayName.isEmpty()) { Runtime.trap("Username and Display Name cannot be empty") };
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };
    if (profile.username.size() > 20) { Runtime.trap("Username too long") };

    // Username format validation (e.g. no special characters) - simplistic check
    if (profile.username.contains(#char ' ')) { Runtime.trap("Username cannot contain spaces") };

    // Anti-impersonation: Check if username is already taken by another user
    for ((principal, existingProfile) in users.entries()) {
      if (existingProfile.username == profile.username) {
        Runtime.trap("Username already taken by another user");
      };
    };

    users.add(caller, profile);

    // Mint a unique per-user coin ("friend stock")
    let ownCoin = getOrCreateCoin(caller);

    // Initialize user SQD balance
    let sqdBalance : Balance = {
      var amount = INITIAL_SQD_AIRDROP;
    };
    sqdBalances.add(caller, sqdBalance);

    // Initialize user coin balances
    let userCoinBalance = Map.empty<Text, ?Balance>();
    let ownCoinBalance : Balance = {
      var amount = ownCoin.totalSupply;
    };
    userCoinBalance.add(ownCoin.symbol, ?ownCoinBalance);
    coinBalances.add(caller, userCoinBalance);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not (users.containsKey(caller))) {
      Runtime.trap("User profile does not exist. Create profile first.");
    };
    if (profile.username.isEmpty() or profile.displayName.isEmpty()) { Runtime.trap("Username and Display Name cannot be empty") };
    if (profile.username.size() > 20) { Runtime.trap("Username too long") };

    // Get current profile to check if username is changing
    let currentProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?p) { p };
    };

    // If username is changing, check for conflicts
    if (currentProfile.username != profile.username) {
      for ((principal, existingProfile) in users.entries()) {
        if (principal != caller and existingProfile.username == profile.username) {
          Runtime.trap("Username already taken by another user");
        };
      };
    };

    users.add(caller, profile);
  };

  public shared ({ caller }) func placeOrder(symbol : Text, side : OrderSide, price : Float, quantity : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    if (quantity == 0) { Runtime.trap("Order quantity must be greater than zero") };
    if (price <= 0.0) { Runtime.trap("Price must be positive") };

    // Validate that the coin exists
    if (not (coins.containsKey(symbol))) {
      Runtime.trap("Coin does not exist");
    };

    // Validate sufficient balance based on order side
    switch (side) {
      case (#sell) {
        // For sell orders, user must have enough of the coin
        let userCoinBalance = getUserCoinBalance(caller, symbol);
        if (userCoinBalance < quantity) {
          Runtime.trap("Insufficient coin balance to place sell order");
        };
      };
      case (#buy) {
        // For buy orders, user must have enough SQD
        let requiredSqd = (price * quantity.toFloat()).toInt();
        if (requiredSqd < 0) {
          Runtime.trap("Invalid order value calculation");
        };
        let userSqdBalance = getUserSqdBalance(caller);
        if (userSqdBalance < Int.abs(requiredSqd)) {
          Runtime.trap("Insufficient SQD balance to place buy order");
        };
      };
    };

    let orderId = orders.size();
    let newOrder : Order = {
      orderId;
      user = caller;
      coinSymbol = symbol;
      side;
      price;
      quantity;
      timestamp = Time.now();
    };

    orders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getOrderBook(symbol : Text, side : OrderSide, depth : ?Nat) : async [Order] {
    // Public read access - anyone can view order book (market data)
    let filteredOrders = orders.values().filter(
      func(order) {
        order.coinSymbol == symbol and order.side == side
      }
    );

    let sortedOrders = switch (side) {
      case (#buy) { filteredOrders.toArray().sort(Orders.compareByPrice) };
      case (#sell) { filteredOrders.toArray().reverse().sort(Orders.compareByPrice) };
    };

    let resultDepth = switch (depth) {
      case (null) { DEFAULT_ORDER_BOOK_DEPTH };
      case (?d) { d };
    };

    sortedOrders.sliceToArray(0, Nat.min(sortedOrders.size(), resultDepth));
  };

  public query ({ caller }) func getBalance(symbol : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check balances");
    };

    switch (symbol) {
      case ("SQD") {
        switch (sqdBalances.get(caller)) {
          case (null) { 0 };
          case (?balance) { balance.amount };
        };
      };
      case (coinSymbol) {
        switch (coinBalances.get(caller)) {
          case (null) { 0 };
          case (?userCoinBalances) {
            switch (userCoinBalances.get(coinSymbol)) {
              case (null) { 0 };
              case (?coinBalance) {
                switch (coinBalance) {
                  case (null) { 0 };
                  case (?validBalance) { validBalance.amount };
                };
              };
            };
          };
        };
      };
    };
  };
};
