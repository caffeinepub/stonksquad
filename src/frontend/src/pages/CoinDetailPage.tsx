import { useState } from 'react';
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
import { usePlaceOrder } from '../hooks/queries/useOrders';
import { OrderSide } from '../backend';
import { TrendingUp, TrendingDown, User, AlertCircle, Zap, Info } from 'lucide-react';
import { formatPriceWithUnit, formatPrice } from '../utils/currency';

export default function CoinDetailPage() {
  const { symbol } = useParams({ strict: false });
  const { data: coinData, isLoading: coinLoading, isError: coinError } = useCoinBySymbol(symbol);
  const { data: buyOrders, isLoading: buyOrdersLoading } = useGetOrderBook(symbol as string, OrderSide.buy);
  const { data: sellOrders, isLoading: sellOrdersLoading } = useGetOrderBook(symbol as string, OrderSide.sell);
  const placeOrderMutation = usePlaceOrder();

  const [buyPrice, setBuyPrice] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');

  const handlePlaceOrder = async (side: OrderSide) => {
    const price = side === OrderSide.buy ? parseFloat(buyPrice) : parseFloat(sellPrice);
    const quantity = side === OrderSide.buy ? parseInt(buyQuantity) : parseInt(sellQuantity);

    if (!symbol || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      return;
    }

    try {
      await placeOrderMutation.mutateAsync({
        symbol: symbol as string,
        side,
        price,
        quantity: BigInt(quantity),
      });

      // Clear form
      if (side === OrderSide.buy) {
        setBuyPrice('');
        setBuyQuantity('');
      } else {
        setSellPrice('');
        setSellQuantity('');
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
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

      {/* Trading Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Book */}
        <Card className="border terminal-border">
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
                        <TableHead className="font-mono">Price (USDC)</TableHead>
                        <TableHead className="font-mono">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyOrders.map((order) => (
                        <TableRow key={Number(order.orderId)}>
                          <TableCell className="font-mono text-accent font-bold">
                            {formatPrice(order.price)}
                          </TableCell>
                          <TableCell className="font-mono">{order.quantity.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-mono">
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
                        <TableHead className="font-mono">Price (USDC)</TableHead>
                        <TableHead className="font-mono">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellOrders.map((order) => (
                        <TableRow key={Number(order.orderId)}>
                          <TableCell className="font-mono text-destructive font-bold">
                            {formatPrice(order.price)}
                          </TableCell>
                          <TableCell className="font-mono">{order.quantity.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-mono">
                    No sell orders
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trade Forms */}
        <div className="space-y-6">
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
                <Label htmlFor="buy-price" className="font-mono font-bold">
                  Price (USDC)
                </Label>
                <Input
                  id="buy-price"
                  type="number"
                  placeholder="0.00"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  step="0.01"
                  className="terminal-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy-quantity" className="font-mono font-bold">
                  Quantity
                </Label>
                <Input
                  id="buy-quantity"
                  type="number"
                  placeholder="0"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  className="terminal-border font-mono"
                />
              </div>
              {buyPrice && buyQuantity && (
                <div className="p-3 bg-muted/30 rounded border border-accent/20">
                  <div className="text-sm font-mono text-muted-foreground">Total Cost</div>
                  <div className="text-xl font-bold font-mono text-accent">
                    {formatPriceWithUnit(parseFloat(buyPrice) * parseInt(buyQuantity))}
                  </div>
                </div>
              )}
              <Button
                onClick={() => handlePlaceOrder(OrderSide.buy)}
                disabled={placeOrderMutation.isPending}
                className="w-full terminal-border font-mono font-bold"
                size="lg"
              >
                {placeOrderMutation.isPending ? 'Placing...' : 'Place Buy Order'}
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
                <Label htmlFor="sell-price" className="font-mono font-bold">
                  Price (USDC)
                </Label>
                <Input
                  id="sell-price"
                  type="number"
                  placeholder="0.00"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  step="0.01"
                  className="terminal-border font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-quantity" className="font-mono font-bold">
                  Quantity
                </Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  placeholder="0"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  className="terminal-border font-mono"
                />
              </div>
              {sellPrice && sellQuantity && (
                <div className="p-3 bg-muted/30 rounded border border-destructive/20">
                  <div className="text-sm font-mono text-muted-foreground">Total Receive</div>
                  <div className="text-xl font-bold font-mono text-destructive">
                    {formatPriceWithUnit(parseFloat(sellPrice) * parseInt(sellQuantity))}
                  </div>
                </div>
              )}
              <Button
                onClick={() => handlePlaceOrder(OrderSide.sell)}
                disabled={placeOrderMutation.isPending}
                variant="destructive"
                className="w-full terminal-border font-mono font-bold"
                size="lg"
              >
                {placeOrderMutation.isPending ? 'Placing...' : 'Place Sell Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {placeOrderMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-mono">
            {placeOrderMutation.error?.message || 'Failed to place order'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
