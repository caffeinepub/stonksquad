import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';

interface DepositParams {
  amountCents: number;
  cardholderName: string;
  cardElement: any;
  stripe: any;
}

interface WithdrawParams {
  amountCents: number;
}

export function useCreateDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountCents, cardholderName, cardElement, stripe }: DepositParams) => {
      if (!actor) throw new Error('Actor not available');
      if (!stripe || !cardElement) throw new Error('Stripe not loaded');

      // Generate a unique session ID
      const sessionId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create session in backend
      await actor.createStripeSession(sessionId, BigInt(amountCents));

      // Create payment method with Stripe
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (pmError) {
        throw new Error(pmError.message || 'Failed to create payment method');
      }

      if (!paymentMethod) {
        throw new Error('Payment method creation failed');
      }

      // In a real implementation, you would:
      // 1. Send payment method to backend
      // 2. Backend creates PaymentIntent with Stripe
      // 3. Backend returns client_secret
      // 4. Frontend confirms payment with client_secret
      // For now, we'll simulate success and finalize the deposit

      // Finalize deposit in backend (credits USDC balance)
      await actor.finalizeDeposit(sessionId);

      return { sessionId, success: true };
    },
    onSuccess: () => {
      // Invalidate balance queries to refresh after deposit
      queryClient.invalidateQueries({ queryKey: ['balance', 'USDC'] });
    },
  });
}

export function useCreateWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountCents }: WithdrawParams) => {
      if (!actor) throw new Error('Actor not available');

      // Generate a unique session ID
      const sessionId = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create session in backend
      await actor.createStripeSession(sessionId, BigInt(amountCents));

      // In a real implementation, you would:
      // 1. Initiate Stripe payout/transfer
      // 2. Handle bank account linking if needed
      // 3. Verify payout status
      // For now, we'll complete the withdrawal immediately

      // Complete withdrawal (deducts USDC balance)
      await actor.completeWithdrawal(sessionId, BigInt(amountCents));

      return { sessionId, success: true };
    },
    onSuccess: () => {
      // Invalidate balance queries to refresh after withdrawal
      queryClient.invalidateQueries({ queryKey: ['balance', 'USDC'] });
    },
  });
}
