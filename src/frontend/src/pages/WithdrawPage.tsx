import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useGetStablecoinBalance } from '../hooks/queries/useStablecoinBalance';
import { useCreateWithdraw } from '../hooks/queries/useFiatRamps';
import { ArrowUpFromLine, AlertTriangle, Info, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { formatStablecoin, formatStablecoinShort } from '../utils/currency';

export default function WithdrawPage() {
  const { data: balance, isLoading: balanceLoading } = useGetStablecoinBalance();
  const createWithdrawMutation = useCreateWithdraw();

  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const balanceInDollars = balance ? Number(balance) / 100 : 0;
  const amountNum = parseFloat(amount) || 0;
  const estimatedFee = Math.max(amountNum * 0.01, 1.0); // 1% fee, minimum $1
  const netAmount = Math.max(0, amountNum - estimatedFee);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum < 10 || amountNum > balanceInDollars) {
      return;
    }

    if (!bankAccount.trim() || !accountHolder.trim() || !routingNumber.trim()) {
      return;
    }

    try {
      const amountCents = Math.round(amountNum * 100);
      await createWithdrawMutation.mutateAsync({ amountCents });
      setWithdrawSuccess(true);
      setAmount('');
      setBankAccount('');
      setAccountHolder('');
      setRoutingNumber('');

      // Reset success message after 5 seconds
      setTimeout(() => setWithdrawSuccess(false), 5000);
    } catch (error: any) {
      console.error('Withdraw error:', error);
    }
  };

  const setQuickAmount = (percentage: number) => {
    const quickAmount = (balanceInDollars * percentage).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-primary/20 pb-6">
        <h1 className="text-4xl font-black font-display tracking-tight mb-2 text-primary flex items-center gap-3">
          <ArrowUpFromLine className="h-10 w-10" />
          WITHDRAW FUNDS
        </h1>
        <p className="text-muted-foreground text-lg font-mono">Convert stablecoin balance to USD</p>
      </div>

      {/* Current Balance */}
      <Card className="border-2 border-primary/30 cyber-glow">
        <CardHeader>
          <CardTitle className="font-display text-xl">AVAILABLE BALANCE</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Skeleton className="h-12 w-48" />
          ) : (
            <div className="text-4xl font-black font-display text-primary">
              {formatStablecoin(balance || BigInt(0))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            {formatStablecoinShort(balance || BigInt(0))} available to withdraw
          </p>
        </CardContent>
      </Card>

      {/* Success Message */}
      {withdrawSuccess && (
        <Alert className="border-accent bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <AlertTitle className="font-mono font-bold text-accent">WITHDRAWAL INITIATED</AlertTitle>
          <AlertDescription className="font-mono">
            Your withdrawal has been processed. Funds will arrive in your bank account within 3-5 business days.
          </AlertDescription>
        </Alert>
      )}

      {/* Withdraw Form */}
      <Card className="border-2 cyber-border">
        <CardHeader>
          <CardTitle className="font-display">WITHDRAW TO BANK</CardTitle>
          <CardDescription className="font-mono">Transfer USDC balance to your bank account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-mono font-bold">
                WITHDRAWAL AMOUNT (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                max={balanceInDollars}
                step="0.01"
                className="text-2xl font-bold cyber-border"
                required
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(0.25)}
                  className="font-mono"
                >
                  25%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(0.5)}
                  className="font-mono"
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(0.75)}
                  className="font-mono"
                >
                  75%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(1.0)}
                  className="font-mono"
                >
                  MAX
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Minimum: $10.00 • Maximum: {formatStablecoinShort(balance || BigInt(0))}
              </p>
            </div>

            <Separator />

            {/* Bank Account Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-muted-foreground">
                <Building2 className="h-4 w-4" />
                BANK ACCOUNT DETAILS
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder" className="font-mono font-bold">
                  ACCOUNT HOLDER NAME
                </Label>
                <Input
                  id="accountHolder"
                  type="text"
                  placeholder="John Doe"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="cyber-border font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber" className="font-mono font-bold">
                  ROUTING NUMBER
                </Label>
                <Input
                  id="routingNumber"
                  type="text"
                  placeholder="123456789"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="cyber-border font-mono"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount" className="font-mono font-bold">
                  ACCOUNT NUMBER
                </Label>
                <Input
                  id="bankAccount"
                  type="text"
                  placeholder="1234567890"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="cyber-border font-mono"
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground font-mono">
                Bank details are securely processed by Stripe and not stored on our servers
              </p>
            </div>

            <Separator />

            {/* Fee Breakdown */}
            {amountNum >= 10 && (
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between text-sm font-mono">
                  <span>Withdrawal Amount:</span>
                  <span className="font-bold">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Processing Fee:</span>
                  <span>-${estimatedFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-mono font-bold">
                  <span>You Receive:</span>
                  <span className="text-accent">${netAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  Funds typically arrive in 3-5 business days
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                amountNum < 10 ||
                amountNum > balanceInDollars ||
                !bankAccount.trim() ||
                !accountHolder.trim() ||
                !routingNumber.trim() ||
                createWithdrawMutation.isPending
              }
              className="w-full h-12 text-lg font-bold font-mono cyber-border"
              size="lg"
            >
              {createWithdrawMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  PROCESSING WITHDRAWAL...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-5 w-5 mr-2" />
                  WITHDRAW ${amountNum.toFixed(2)}
                </>
              )}
            </Button>

            {createWithdrawMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Withdrawal Failed</AlertTitle>
                <AlertDescription className="font-mono">
                  {createWithdrawMutation.error?.message || 'Unable to process withdrawal. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Compliance & Risk Warnings */}
      <Alert className="border-accent/50 bg-accent/5">
        <Info className="h-4 w-4 text-accent" />
        <AlertTitle className="font-mono font-bold">WITHDRAWAL LIMITS & VERIFICATION</AlertTitle>
        <AlertDescription className="font-mono text-sm space-y-2">
          <p>
            Withdrawals may be subject to identity verification, daily/monthly limits, and compliance reviews. Large
            withdrawals may require additional documentation.
          </p>
          <p className="text-xs text-muted-foreground">Processing time: 3-5 business days for ACH transfers</p>
        </AlertDescription>
      </Alert>

      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle className="font-mono font-bold">IMPORTANT NOTICE</AlertTitle>
        <AlertDescription className="font-mono text-sm">
          Ensure your bank account details are correct. Incorrect information may result in failed transfers and
          additional fees. Withdrawals cannot be cancelled once processed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
