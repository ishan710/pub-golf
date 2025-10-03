"use client";
import React, { useEffect, useState } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import StripeProvider from '@/components/StripeProvider';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PayInner() {
  const router = useRouter();
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<stripe.paymentRequest.PaymentRequest | null>(null);
  const [supported, setSupported] = useState(false);
  const [amount, setAmount] = useState(3000); // $30.00

  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: "Bar Tab", amount },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    
    pr.canMakePayment().then((res) => {
      setSupported(!!res);
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'usd', description: 'Pub Golf Bar Payment' }),
        });
        const { clientSecret } = await piRes.json();

        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: ev.paymentMethod.id,
        }, { handleActions: false });

        if (confirmError) {
          ev.complete('fail');
          return;
        }

        ev.complete('success');
        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) {
          alert(error.message);
        } else {
          alert('Payment successful! 🎉');
        }
      } catch (e: any) {
        ev.complete('fail');
        alert(e.message || 'Payment failed');
      }
    });

    setPaymentRequest(pr);
  }, [stripe, amount]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <button 
          onClick={() => router.back()}
          className="glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#252540] transition-all flex items-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4ECDC4] to-[#FFE66D] rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Pay the Bar</h1>
            <p className="text-gray-400">Quick & secure payment</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto pb-6">
        {/* Amount Selector */}
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Payment Amount
          </label>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl font-bold text-gradient">
              ${(amount / 100).toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1000, 2000, 3000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  amount === amt 
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFE66D] text-white' 
                    : 'glass hover:bg-[#252540]'
                }`}
              >
                ${amt / 100}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
            <div className="card border-2 border-red-500/30 bg-red-500/10">
              <p className="text-red-400 text-center">
                Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable payments
              </p>
            </div>
          ) : supported && paymentRequest ? (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-[#4ECDC4]" />
                <h3 className="font-semibold">Digital Wallet</h3>
              </div>
              <div className="bg-white rounded-xl p-2">
                <PaymentRequestButtonElement options={{ paymentRequest }} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="card border-2 border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="font-semibold">Apple Pay / Google Pay</h3>
                    <p className="text-sm text-gray-500">Not available on this device</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Try Safari on iOS/macOS with a saved card in Wallet
                </p>
                <a 
                  href="https://wallet.apple.com/add-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Add Card to Apple Wallet
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="glass rounded-2xl p-4 mt-6">
          <p className="text-xs text-gray-500 text-center">
            🔒 Payments are processed securely through Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <StripeProvider>
      <PayInner />
    </StripeProvider>
  );
}
