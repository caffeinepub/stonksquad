import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useGetStablecoinBalance } from '../hooks/queries/useStablecoinBalance';
import { useCreateDeposit } from '../hooks/queries/useFiatRamps';
import { ArrowDownToLine, AlertTriangle, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { formatStablecoin } from '../utils/currency';
import { getStripe } from '../utils/stripe';
import StripeCardFields from '../components/payments/StripeCardFields';

export default function DepositPage() {
  const { data: balance, isLoading: balanceLoading } = useGetStablecoinBalance();
  const createDepositMutation = useCreateDeposit();

  const [amount, setAmount] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [cardElement, setCardElement] = useState<any>(null);

  const amountNum = parseFloat(amount) || 0;
  const estimatedFee = amountNum * 0.029 + 0.3; // Stripe standard fee estimate
  const totalAmount = amountNum + estimatedFee;
  const usdcAmount = amountNum; // 1:1 conversion

  const handleCardElementReady = useCallback((element: any) => {
    setCardElement(element);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum < 1 || !cardholderName.trim() || !cardElement) {
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not loaded');
      return;
    }

    try {
      const amountCents = Math.round(totalAmount * 100);
      await createDepositMutation.mutateAsync({ amountCents, cardholderName, cardElement, stripe });
      setDepositSuccess(true);
      setAmount('');
      setCardholderName('');

      // Reset success message after 5 seconds
      setTimeout(() => setDepositSuccess(false), 5000);
    } catch (error: any) {
      console.error('Deposit error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-primary/20 pb-6">
        <h1 className="text-4xl font-black font-display tracking-tight mb-2 text-primary flex items-center gap-3">
          <ArrowDownToLine className="h-10 w-10" />
          FUND ACCOUNT
        </h1>
        <p className="text-muted-foreground text-lg font-mono">Deposit USD to receive stablecoin balance</p>
      </div>

      {/* Current Balance */}
      <Card className="border-2 border-primary/30 cyber-glow">
        <CardHeader>
          <CardTitle className="font-display text-xl">CURRENT BALANCE</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Skeleton className="h-12 w-48" />
          ) : (
            <div className="text-4xl font-black font-display text-primary">
              {formatStablecoin(balance || BigInt(0))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2 font-mono">Available for trading</p>
        </CardContent>
      </Card>

      {/* Success Message */}
      {depositSuccess && (
        <Alert className="border-accent bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <AlertTitle className="font-mono font-bold text-accent">DEPOSIT SUCCESSFUL</AlertTitle>
          <AlertDescription className="font-mono">
            Your USDC balance has been updated. You can now trade on the platform.
          </AlertDescription>
        </Alert>
      )}

      {/* Deposit Form */}
      <Card className="border-2 cyber-border">
        <CardHeader>
          <CardTitle className="font-display">DEPOSIT FUNDS</CardTitle>
          <CardDescription className="font-mono">Add USD to your account via secure card payment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-mono font-bold">
                DEPOSIT AMOUNT (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="text-2xl font-bold cyber-border"
                required
              />
              <p className="text-xs text-muted-foreground font-mono">Minimum: $1.00</p>
            </div>

            <Separator />

            {/* Stripe Card Fields */}
            <StripeCardFields
              cardholderName={cardholderName}
              onCardholderNameChange={setCardholderName}
              onCardElementReady={handleCardElementReady}
            />

            <Separator />

            {/* Fee Breakdown */}
            {amountNum > 0 && (
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between text-sm font-mono">
                  <span>Deposit Amount:</span>
                  <span className="font-bold">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Processing Fee (est.):</span>
                  <span>${estimatedFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-mono font-bold">
                  <span>Total Charge:</span>
                  <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-accent">
                  <span>You Receive:</span>
                  <span className="font-bold">{usdcAmount.toFixed(2)} USDC</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={amountNum < 1 || !cardholderName.trim() || !cardElement || createDepositMutation.isPending}
              className="w-full h-12 text-lg font-bold font-mono cyber-border"
              size="lg"
            >
              {createDepositMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  PROCESSING PAYMENT...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-5 w-5 mr-2" />
                  DEPOSIT ${totalAmount.toFixed(2)}
                </>
              )}
            </Button>

            {createDepositMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Deposit Failed</AlertTitle>
                <AlertDescription className="font-mono">
                  {createDepositMutation.error?.message || 'Unable to process deposit. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Compliance & Risk Warnings */}
      <Alert className="border-accent/50 bg-accent/5">
        <Info className="h-4 w-4 text-accent" />
        <AlertTitle className="font-mono font-bold">VERIFICATION REQUIRED</AlertTitle>
        <AlertDescription className="font-mono text-sm space-y-2">
          <p>
            Identity verification may be required and is handled by our payment provider (Stripe). Deposits may be
            delayed for review or compliance checks.
          </p>
          <p className="text-xs text-muted-foreground">
            By depositing, you agree to our Terms of Service and acknowledge the risks of trading digital assets.
          </p>
        </AlertDescription>
      </Alert>

      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle className="font-mono font-bold">RISK WARNING</AlertTitle>
        <AlertDescription className="font-mono text-sm">
          Trading involves substantial risk of loss. Only deposit funds you can afford to lose. This platform is for
          entertainment and educational purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
