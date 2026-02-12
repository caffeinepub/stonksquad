import { useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCoinBySymbol } from '../hooks/queries/useCoinsDirectory';
import { useGetOrderBook } from '../hooks/queries/useOrderBook';
import { usePlaceMarketOrder } from '../hooks/queries/useOrders';
import { usePriceHistory } from '../hooks/queries/usePriceHistory';
import { PriceHistoryChart } from '../components/trading/PriceHistoryChart';
import { OrderSide } from '../backend';
import { TrendingUp, TrendingDown, User, AlertCircle, Zap, Info } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function CoinDetailPage() {
  const { symbol } = useParams({ strict: false });
  const { data: coinData, isLoading: coinLoading, isError: coinError } = useCoinBySymbol(symbol);
  const { data: buyOrders, isLoading: buyOrdersLoading } = useGetOrderBook(symbol as string, OrderSide.buy);
  const { data: sellOrders, isLoading: sellOrdersLoading } = useGetOrderBook(symbol as string, OrderSide.sell);
  const { data: priceHistory, isLoading: priceHistoryLoading } = usePriceHistory(symbol as string);
  const placeMarketOrderMutation = usePlaceMarketOrder();

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  // Calculate market prices from order book
  const marketPrices = useMemo(() => {
    // For buying, we look at the best sell order (lowest sell price)
    const bestSellPrice = sellOrders && sellOrders.length > 0 
      ? Math.min(...sellOrders.map(o => o.price))
      : null;
    
    // For selling, we look at the best buy order (highest buy price)
    const bestBuyPrice = buyOrders && buyOrders.length > 0
      ? Math.max(...buyOrders.map(o => o.price))
      : null;

    return {
      buyPrice: bestSellPrice, // Price to buy at (from sell orders)
      sellPrice: bestBuyPrice, // Price to sell at (from buy orders)
    };
  }, [buyOrders, sellOrders]);

  // Calculate execution previews
  const buyPreview = useMemo(() => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0 || !marketPrices.buyPrice) return null;
    
    const estimatedQuantity = amount / marketPrices.buyPrice;
    return {
      quantity: estimatedQuantity,
      price: marketPrices.buyPrice,
      total: amount,
    };
  }, [buyAmount, marketPrices.buyPrice]);

  const sellPreview = useMemo(() => {
    const amount = parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0 || !marketPrices.sellPrice) return null;
    
    const estimatedQuantity = amount / marketPrices.sellPrice;
    return {
      quantity: estimatedQuantity,
      price: marketPrices.sellPrice,
      total: amount,
    };
  }, [sellAmount, marketPrices.sellPrice]);

  const handlePlaceMarketOrder = async (side: OrderSide) => {
    const amount = side === OrderSide.buy ? parseFloat(buyAmount) : parseFloat(sellAmount);

    if (!symbol || isNaN(amount) || amount <= 0) {
      return;
    }

    // Convert to cents (USDC is stored in cents)
    const amountInCents = Math.floor(amount * 100);

    try {
      await placeMarketOrderMutation.mutateAsync({
        symbol: symbol as string,
        side,
        amountToSpend: BigInt(amountInCents),
      });

      // Clear form
      if (side === OrderSide.buy) {
        setBuyAmount('');
      } else {
        setSellAmount('');
      }
    } catch (error: any) {
      console.error('Market order placement error:', error);
    }
  };

  if (coinLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (coinError || !coinData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Asset not found or failed to load</AlertDescription>
      </Alert>
    );
  }

  const { coin, profile } = coinData;
  const hasOrders = (buyOrders && buyOrders.length > 0) || (sellOrders && sellOrders.length > 0);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-2 border-primary/20 terminal-glow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black font-display text-foreground">
                {profile?.displayName || coin.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-mono">@{profile?.username || coin.symbol}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-muted-foreground">Asset Symbol</div>
              <div className="text-2xl font-black font-display text-accent">{symbol}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-mono">{profile?.bio || coin.description}</p>
        </CardContent>
      </Card>

      {/* Price Discovery Notice */}
      {!hasOrders && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="font-mono">
            No orders yet. Be the first to place an order and discover the price for this asset.
          </AlertDescription>
        </Alert>
      )}

      {/* Price Chart */}
      <Card className="border terminal-border">
        <CardHeader>
          <CardTitle className="font-display">Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceHistoryChart 
            data={priceHistory || []} 
            symbol={symbol as string}
            isLoading={priceHistoryLoading}
          />
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <Card className="border terminal-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="font-mono">
                  Buy Orders
                </TabsTrigger>
                <TabsTrigger value="sell" className="font-mono">
                  Sell Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="mt-4">
                {buyOrdersLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : buyOrders && buyOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono">Price</TableHead>
                        <TableHead className="font-mono">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyOrders.map((order) => (
                        <TableRow key={Number(order.orderId)}>
                          <TableCell className="font-mono text-accent font-bold">
                            ${formatPrice(order.price)}
                          </TableCell>
                          <TableCell className="font-mono">{order.quantity.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                    No buy orders
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sell" className="mt-4">
                {sellOrdersLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : sellOrders && sellOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono">Price</TableHead>
                        <TableHead className="font-mono">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellOrders.map((order) => (
                        <TableRow key={Number(order.orderId)}>
                          <TableCell className="font-mono text-destructive font-bold">
                            ${formatPrice(order.price)}
                          </TableCell>
                          <TableCell className="font-mono">{order.quantity.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                    No sell orders
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trade Forms */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buy Form */}
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-accent">
                  <TrendingUp className="h-5 w-5" />
                  Buy {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-amount" className="font-mono font-bold">
                    Amount to Spend (USDC)
                  </Label>
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.00"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    step="0.01"
                    className="terminal-border font-mono text-lg"
                  />
                </div>

                {/* Execution Preview */}
                {buyPreview ? (
                  <div className="p-4 bg-accent/10 rounded border border-accent/30 space-y-2">
                    <div className="text-xs font-mono text-muted-foreground uppercase">
                      Estimated Execution
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-bold font-mono text-accent">
                          ~{buyPreview.quantity.toFixed(2)} shares
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono text-muted-foreground">Market Price:</span>
                        <span className="text-sm font-bold font-mono text-accent">
                          ${formatPrice(buyPreview.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/20 rounded border border-border">
                    <div className="text-sm font-mono text-muted-foreground text-center">
                      {!marketPrices.buyPrice 
                        ? 'No market price available. Place a sell order first.'
                        : 'Enter amount to see preview'}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handlePlaceMarketOrder(OrderSide.buy)}
                  disabled={
                    placeMarketOrderMutation.isPending || 
                    !buyPreview || 
                    !marketPrices.buyPrice
                  }
                  className="w-full terminal-border font-mono font-bold text-lg"
                  size="lg"
                >
                  {placeMarketOrderMutation.isPending ? 'Processing...' : 'Buy Market'}
                </Button>
              </CardContent>
            </Card>

            {/* Sell Form */}
            <Card className="border-2 border-destructive/20">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-5 w-5" />
                  Sell {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-amount" className="font-mono font-bold">
                    Amount to Spend (USDC)
                  </Label>
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    step="0.01"
                    className="terminal-border font-mono text-lg"
                  />
                </div>

                {/* Execution Preview */}
                {sellPreview ? (
                  <div className="p-4 bg-destructive/10 rounded border border-destructive/30 space-y-2">
                    <div className="text-xs font-mono text-muted-foreground uppercase">
                      Estimated Execution
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-bold font-mono text-destructive">
                          ~{sellPreview.quantity.toFixed(2)} shares
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono text-muted-foreground">Market Price:</span>
                        <span className="text-sm font-bold font-mono text-destructive">
                          ${formatPrice(sellPreview.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/20 rounded border border-border">
                    <div className="text-sm font-mono text-muted-foreground text-center">
                      {!marketPrices.sellPrice 
                        ? 'No market price available. Place a buy order first.'
                        : 'Enter amount to see preview'}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handlePlaceMarketOrder(OrderSide.sell)}
                  disabled={
                    placeMarketOrderMutation.isPending || 
                    !sellPreview || 
                    !marketPrices.sellPrice
                  }
                  variant="destructive"
                  className="w-full terminal-border font-mono font-bold text-lg"
                  size="lg"
                >
                  {placeMarketOrderMutation.isPending ? 'Processing...' : 'Sell Market'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {placeMarketOrderMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-mono">
            {placeMarketOrderMutation.error?.message || 'Failed to place market order'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
