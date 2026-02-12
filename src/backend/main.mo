import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

// Persistent Market Cap Tracking
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
    symbol : Text; // Unique identifier, originally from username
    name : Text;
    description : Text;
    totalSupply : Nat;
    metadata : ?Text; // Optional metadata field for future extensibility
  };

  module Coins {
    public func compare(coin1 : Coin, coin2 : Coin) : Order.Order {
      Text.compare(coin1.symbol, coin2.symbol);
    };
  };

  type Balance = {
    var amount : Nat;
  };

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

  // Persistent Maps
  let coins = Map.empty<Text, Coin>();
  let users = Map.empty<Principal, UserProfile>();
  let sqdBalances = Map.empty<Principal, Balance>();
  let coinBalances = Map.empty<Principal, Map.Map<Text, Balance>>();
  let orders = Map.empty<Nat, Order>();
  let usdcBalances = Map.empty<Principal, Balance>();
  let marketCapTrends = Map.empty<Principal, List.List<MarketCapTrendPoint>>();

  // Constants
  let INITIAL_SQD_AIRDROP = 1000;
  let INITIAL_COIN_SUPPLY = 10000;
  let DEFAULT_ORDER_BOOK_DEPTH = 10;

  // Stripe Sessions (not persistent)
  let stripeSessions = Map.empty<Text, StripeSession>();
  var nextOrderId = 0;

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
              metadata = null;
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
          case (?balance) { balance.amount };
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

  func getUserUsdcBalance(user : Principal) : Nat {
    switch (usdcBalances.get(user)) {
      case (null) { 0 };
      case (?balance) { balance.amount };
    };
  };

  func getTotalMarketCap(creator : Principal) : Nat {
    coins.values().toArray().filter(func(coin) { coin.owner == creator }).foldLeft(
      0,
      func(acc, coin) {
        let price = getCurrentPriceForCap(coin.symbol);
        let cap = price * coin.totalSupply.toFloat();
        acc + cap.toInt().toNat();
      },
    );
  };

  func getCurrentPriceForCap(symbol : Text) : Float {
    let matchingOrders = orders.values().toArray().filter(
      func(order) { order.coinSymbol == symbol }
    );

    // Use only non-0 confirmed price discovery data, else return 0.0
    if (matchingOrders.size() == 0) { return 0.0 };

    // If all prices are 0 (buggy) we need to default to 0
    var hasNonZeroPrice = false;
    let (sum, count) = matchingOrders.foldLeft(
      (0.0, 0),
      func(acc, order) {
        if (order.price != 0.0) { hasNonZeroPrice := true };
        let (sum, count) = acc;
        (sum + order.price, count + 1);
      },
    );

    if (not hasNonZeroPrice) { return 0.0 };

    sum / count.toFloat();
  };

  func calculateCurrentPrice(symbol : Text) : Float {
    let matchingOrders = orders.values().toArray().filter(
      func(order) { order.coinSymbol == symbol }
    );
    if (matchingOrders.size() == 0) { return 0.0 };
    let (sum, count) = matchingOrders.foldLeft(
      (0.0, 0),
      func(acc, order) {
        let (sum, count) = acc;
        (sum + order.price, count + 1);
      },
    );
    sum / count.toFloat();
  };

  func getCreatorCoins(creator : Principal) : [Coin] {
    coins.values().toArray().filter(func(coin) { coin.owner == creator });
  };

  func updateMarketCapTrend(user : Principal) {
    let currentCap = getTotalMarketCap(user);
    let newPoint : MarketCapTrendPoint = {
      timestamp = Time.now();
      marketCap = currentCap;
    };

    let trend = switch (marketCapTrends.get(user)) {
      case (null) { List.empty<MarketCapTrendPoint>() };
      case (?existingTrend) { existingTrend };
    };

    trend.add(newPoint);
    marketCapTrends.add(user, trend);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    users.get(caller);
  };

  public query func getPublicUserProfile(user : Principal) : async ?UserProfile {
    users.get(user);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Users can only view their own profile unless they are admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func createCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };
    if (profile.username.isEmpty() or profile.displayName.isEmpty()) { Runtime.trap("Username and Display Name cannot be empty") };
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };
    if (profile.username.size() > 20) { Runtime.trap("Username too long") };

    // Username format validation (no spaces)
    if (profile.username.contains(#char ' ')) { Runtime.trap("Username cannot contain spaces") };

    for ((principal, existingProfile) in users.entries()) {
      if (existingProfile.username == profile.username) {
        Runtime.trap("Username already taken by another user");
      };
    };

    users.add(caller, profile);
    let ownCoin = getOrCreateCoin(caller);
    let sqdBalance : Balance = {
      var amount = INITIAL_SQD_AIRDROP;
    };
    sqdBalances.add(caller, sqdBalance);

    let userCoinBalance = Map.empty<Text, Balance>();
    let ownCoinBalance : Balance = {
      var amount = ownCoin.totalSupply;
    };
    userCoinBalance.add(ownCoin.symbol, ownCoinBalance);
    coinBalances.add(caller, userCoinBalance);

    let usdcBalance : Balance = {
      var amount = 0;
    };
    usdcBalances.add(caller, usdcBalance);
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

    let currentProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?p) { p };
    };

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

    if (not (coins.containsKey(symbol))) {
      Runtime.trap("Coin does not exist");
    };

    switch (side) {
      case (#sell) {
        let userCoinBalance = getUserCoinBalance(caller, symbol);
        if (userCoinBalance < quantity) {
          Runtime.trap("Insufficient coin balance to place sell order");
        };
      };
      case (#buy) {
        let requiredUsdc = (price * quantity.toFloat()).toInt();
        if (requiredUsdc < 0) {
          Runtime.trap("Invalid order value calculation");
        };
        let userUsdcBalance = switch (usdcBalances.get(caller)) {
          case (null) { Runtime.trap("USDC Balance does not exist") };
          case (?balance) { balance };
        };
        if (userUsdcBalance.amount < Int.abs(requiredUsdc)) {
          Runtime.trap("Insufficient USDC balance to place buy order");
        };
      };
    };

    let orderId = nextOrderId;
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
    nextOrderId += 1;

    // Update market cap trend after new order
    updateMarketCapTrend(caller);
    orderId;
  };

  public query ({ caller }) func getOrderBook(symbol : Text, side : OrderSide, depth : ?Nat) : async [Order] {
    // No authorization check - public market data accessible to all users including guests
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
      case ("SQD") { getUserSqdBalance(caller) };
      case ("USDC") { getUserUsdcBalance(caller) };
      case (coinSymbol) {
        switch (coinBalances.get(caller)) {
          case (null) { 0 };
          case (?userCoinBalances) {
            switch (userCoinBalances.get(coinSymbol)) {
              case (null) { 0 };
              case (?coinBalance) { coinBalance.amount };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getCreatorCapRanking() : async [(Principal, Nat)] {
    // No authorization check - public leaderboard data accessible to all users including guests
    let entriesList = List.empty<(Principal, Nat)>();

    for ((principal, balance) in sqdBalances.entries()) {
      entriesList.add((principal, getTotalMarketCap(principal)));
    };

    let entriesArray = entriesList.toArray();
    let sortedEntries = entriesArray.sort(
      func(a, b) {
        Nat.compare(b.1, a.1);
      }
    );
    sortedEntries;
  };

  public query ({ caller }) func getCreatorCoinsWithMarketCaps() : async [(Principal, [Coin], Nat)] {
    // No authorization check - public creator data accessible to all users including guests
    let resultList = List.empty<(Principal, [Coin], Nat)>();

    for ((creator, userProfile) in users.entries()) {
      let creatorCoins = getCreatorCoins(creator);
      var totalCap : Nat = 0;
      for (coin in creatorCoins.values()) {
        let price = calculateCurrentPrice(coin.symbol);
        totalCap += price.toInt().toNat();
      };
      resultList.add((creator, creatorCoins, totalCap));
    };

    resultList.toArray();
  };

  public query func getMarketCapTrend(user : Principal) : async [MarketCapTrendPoint] {
    switch (marketCapTrends.get(user)) {
      case (null) { [] };
      case (?trend) { trend.toArray() };
    };
  };

  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    // No authorization check - public configuration status accessible to all
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    // No authorization check - transform function for HTTP outcalls
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query session status");
    };

    switch (stripeSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        if (session.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only query your own sessions");
        };
      };
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func createStripeSession(sessionId : Text, amountCents : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sessions");
    };

    let session : StripeSession = {
      user = caller;
      status = #pending;
      amountCents = amountCents;
    };
    stripeSessions.add(sessionId, session);
  };

  public shared ({ caller }) func finalizeDeposit(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finalize deposits");
    };

    switch (stripeSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        if (session.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only finalize your own deposit sessions");
        };

        switch (session.status) {
          case (#pending) {};
          case (#failed) { Runtime.trap("Deposit session failed") };
          case (#completed) { Runtime.trap("Deposit already completed") };
        };

        let balance = switch (usdcBalances.get(session.user)) {
          case (null) { Runtime.trap("USDC Balance does not exist") };
          case (?balance) { balance };
        };

        balance.amount += session.amountCents;

        let updatedSession : StripeSession = {
          user = session.user;
          status = #completed;
          amountCents = session.amountCents;
        };
        stripeSessions.add(sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func completeWithdrawal(sessionId : Text, amountCents : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete withdrawals");
    };

    switch (stripeSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        if (session.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only complete your own withdrawal sessions");
        };
        switch (session.status) {
          case (#pending) {};
          case (#failed) { Runtime.trap("Session failed") };
          case (#completed) { Runtime.trap("Withdrawal already completed") };
        };
        if (session.amountCents != amountCents) {
          Runtime.trap("Amount mismatch with session");
        };

        let balance = switch (usdcBalances.get(session.user)) {
          case (null) { Runtime.trap("USDC Balance does not exist") };
          case (?balance) { balance };
        };
        if (balance.amount < amountCents) {
          Runtime.trap("Insufficient balance for withdrawal");
        };
        balance.amount -= amountCents;

        let updatedSession : StripeSession = {
          user = session.user;
          status = #completed;
          amountCents = session.amountCents;
        };
        stripeSessions.add(sessionId, updatedSession);
      };
    };
  };

};
