import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for occasional casual downloading.",
      features: [
        { name: "Up to 720p video quality", included: true },
        { name: "Standard audio quality (128kbps)", included: true },
        { name: "5 downloads per day", included: true },
        { name: "Download history (7 days)", included: true },
        { name: "Ad-free experience", included: false },
        { name: "Batch downloading", included: false },
        { name: "Priority support", included: false },
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Premium",
      price: "₹25",
      period: "/mo",
      description: "For power users who need pristine quality.",
      features: [
        { name: "Up to 4K video quality", included: true },
        { name: "Lossless audio quality (320kbps+)", included: true },
        { name: "Unlimited downloads", included: true },
        { name: "Unlimited download history", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Batch downloading", included: true },
        { name: "Priority support", included: false },
      ],
      buttonText: "Upgrade to Premium",
      popular: true
    },
    {
      name: "Business",
      price: "₹50",
      period: "/mo",
      description: "For agencies and professional creators.",
      features: [
        { name: "Up to 8K video quality", included: true },
        { name: "Lossless audio quality (320kbps+)", included: true },
        { name: "Unlimited downloads", included: true },
        { name: "Unlimited download history", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Batch downloading", included: true },
        { name: "Priority support 24/7", included: true },
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 py-20 flex flex-col items-center">
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">Unlock the full potential of MediaDrop. Upgrade anytime.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative flex flex-col p-8 rounded-2xl border ${
              plan.popular 
                ? "bg-card border-primary shadow-2xl shadow-primary/10" 
                : "bg-card/50 border-white/10"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              variant={plan.popular ? "default" : "outline"} 
              className={`w-full ${plan.popular ? "shadow-lg shadow-primary/25" : ""}`}
              size="lg"
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
