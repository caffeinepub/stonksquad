import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetOrderBook } from '../hooks/queries/useOrderBook';
import { usePlaceOrder } from '../hooks/queries/useOrders';
import { OrderSide } from '../backend';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function CoinDetailPage() {
  const { symbol } = useParams({ from: '/authenticated/coins/$symbol' });
  const [buyPrice, setBuyPrice] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');

  const { data: buyOrders, isLoading: buyOrdersLoading } = useGetOrderBook(symbol, OrderSide.buy);
  const { data: sellOrders, isLoading: sellOrdersLoading } = useGetOrderBook(symbol, OrderSide.sell);
  const placeOrderMutation = usePlaceOrder();

  const handlePlaceBuyOrder = async () => {
    if (!buyPrice || !buyQuantity) return;
    try {
      await placeOrderMutation.mutateAsync({
        symbol,
        side: OrderSide.buy,
        price: parseFloat(buyPrice),
        quantity: BigInt(buyQuantity),
      });
      setBuyPrice('');
      setBuyQuantity('');
    } catch (error) {
      console.error('Failed to place buy order:', error);
    }
  };

  const handlePlaceSellOrder = async () => {
    if (!sellPrice || !sellQuantity) return;
    try {
      await placeOrderMutation.mutateAsync({
        symbol,
        side: OrderSide.sell,
        price: parseFloat(sellPrice),
        quantity: BigInt(sellQuantity),
      });
      setSellPrice('');
      setSellQuantity('');
    } catch (error) {
      console.error('Failed to place sell order:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight">{symbol}</h1>
            <Badge variant="outline" className="text-sm">
              Profile
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">Trade shares with this member</p>
        </div>
      </div>

      {/* Order Book & Trading */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Book</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buy Orders
                </TabsTrigger>
                <TabsTrigger value="sell">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Sell Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4">
                {buyOrdersLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !buyOrders || buyOrders.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No buy orders available</AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price (SQD)</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyOrders.map((order) => (
                        <TableRow key={order.orderId.toString()}>
                          <TableCell className="font-mono text-chart-2">{order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.quantity.toString()}</TableCell>
                          <TableCell className="font-mono">
                            {(order.price * Number(order.quantity)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="sell" className="space-y-4">
                {sellOrdersLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !sellOrders || sellOrders.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No sell orders available</AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price (SQD)</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellOrders.map((order) => (
                        <TableRow key={order.orderId.toString()}>
                          <TableCell className="font-mono text-destructive">{order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.quantity.toString()}</TableCell>
                          <TableCell className="font-mono">
                            {(order.price * Number(order.quantity)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trade Ticket */}
        <div className="space-y-6">
          {/* Buy */}
          <Card className="border-chart-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-chart-2">
                <TrendingUp className="h-5 w-5" />
                Place Buy Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-price">Price (SQD)</Label>
                <Input
                  id="buy-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy-quantity">Quantity</Label>
                <Input
                  id="buy-quantity"
                  type="number"
                  placeholder="0"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePlaceBuyOrder}
                disabled={!buyPrice || !buyQuantity || placeOrderMutation.isPending}
                className="w-full bg-chart-2 hover:bg-chart-2/90"
              >
                {placeOrderMutation.isPending ? 'Placing...' : 'Place Buy Order'}
              </Button>
            </CardContent>
          </Card>

          {/* Sell */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <TrendingDown className="h-5 w-5" />
                Place Sell Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-price">Price (SQD)</Label>
                <Input
                  id="sell-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-quantity">Quantity</Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  placeholder="0"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePlaceSellOrder}
                disabled={!sellPrice || !sellQuantity || placeOrderMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {placeOrderMutation.isPending ? 'Placing...' : 'Place Sell Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
