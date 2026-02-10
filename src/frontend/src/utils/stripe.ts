// Stripe utility using the global Stripe object loaded via script tag
// Since @stripe/stripe-js is not available, we use the global window.Stripe

declare global {
  interface Window {
    Stripe: any;
  }
}

let stripeInstance: any = null;

export const getStripe = (): any => {
  if (!stripeInstance && typeof window !== 'undefined' && window.Stripe) {
    // In production, this should come from environment config
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
    stripeInstance = window.Stripe(publishableKey);
  }
  return stripeInstance;
};

export type StripeCardElementChangeEvent = {
  complete: boolean;
  error?: {
    message: string;
  };
};
