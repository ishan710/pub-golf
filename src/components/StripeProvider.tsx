"use client";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  if (!stripePromise) return <>{children}</>;
  return <Elements stripe={stripePromise}>{children}</Elements>;
}