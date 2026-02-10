import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getStripe } from '../../utils/stripe';

interface StripeCardFieldsProps {
  onCardholderNameChange: (name: string) => void;
  cardholderName: string;
  onCardElementReady?: (element: any) => void;
}

export default function StripeCardFields({
  onCardholderNameChange,
  cardholderName,
  onCardElementReady,
}: StripeCardFieldsProps) {
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardElement, setCardElement] = useState<any>(null);

  useEffect(() => {
    if (!cardElementRef.current) return;

    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not loaded');
      return;
    }

    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: 'hsl(var(--foreground))',
          fontFamily: '"Rajdhani", sans-serif',
          '::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
          iconColor: 'hsl(var(--primary))',
        },
        invalid: {
          color: 'hsl(var(--destructive))',
          iconColor: 'hsl(var(--destructive))',
        },
      },
      hidePostalCode: true,
    });

    card.mount(cardElementRef.current);
    setCardElement(card);

    card.on('change', (event: any) => {
      setCardError(event.error ? event.error.message : null);
    });

    if (onCardElementReady) {
      onCardElementReady(card);
    }

    return () => {
      card.unmount();
    };
  }, [onCardElementReady]);

  return (
    <div className="space-y-4">
      {/* Cardholder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName" className="font-mono font-bold">
          CARDHOLDER NAME
        </Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => onCardholderNameChange(e.target.value)}
          className="cyber-border font-mono"
          required
        />
      </div>

      {/* Card Details */}
      <div className="space-y-2">
        <Label className="font-mono font-bold">CARD DETAILS</Label>
        <div ref={cardElementRef} className="p-3 border-2 rounded-md cyber-border bg-background" />
        {cardError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">{cardError}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground font-mono">Secure payment processing powered by Stripe</p>
      </div>
    </div>
  );
}
