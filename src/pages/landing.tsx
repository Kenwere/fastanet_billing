import { Link } from "wouter";
import { Zap, Shield, CreditCard, Router, Wifi, BarChart3, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Router,
    title: "MikroTik Integration",
    desc: "Full RouterOS API support for hotspot and PPPoE. Add routers with one click and download pre-configured .rsc scripts.",
  },
  {
    icon: Zap,
    title: "Automated Billing",
    desc: "Auto-activate users after payment, set expiry dates, and disconnect expired accounts — all without manual intervention.",
  },
  {
    icon: Wifi,
    title: "Hotspot & PPPoE",
    desc: "Manage captive portal hotspots and PPPoE accounts from a single dashboard. Voucher system included.",
  },
  {
    icon: CreditCard,
    title: "African Payment Gateways",
    desc: "M-Pesa Till, Paystack, PesaPal, and IntaSend — accept payments the way your customers prefer.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant SaaS",
    desc: "Each ISP gets an isolated environment with their own subdomain, branding, and customer data.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track revenue, active sessions, router uptime, and user growth with live charts and dashboards.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "KES 2,999",
    period: "/month",
    desc: "For small ISPs getting started",
    features: ["Up to 2 routers", "100 active users", "Basic billing", "M-Pesa support", "Email support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Business",
    price: "KES 7,999",
    period: "/month",
    desc: "For growing ISP businesses",
    features: ["Up to 10 routers", "1,000 active users", "Full billing automation", "All payment gateways", "Voucher system", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large ISP networks",
    features: ["Unlimited routers", "Unlimited users", "White-label branding", "Custom subdomain", "API access", "Dedicated support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">FASTANET</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" data-testid="button-login">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-register">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3 h-3" />
          ISP Billing & Hotspot Management
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
          Run Your ISP Business
          <br />
          <span className="text-primary">Smarter & Faster</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          FASTANET gives African ISPs a complete platform to manage MikroTik routers,
          hotspot users, PPPoE accounts, automated billing, and payments — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8" data-testid="button-hero-cta">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="px-8" data-testid="button-view-demo">
              View Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-16 border-t">
          {[
            { value: "500+", label: "ISPs onboarded" },
            { value: "50K+", label: "Active users managed" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything an ISP needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From router setup to payment collection, FASTANET automates the tedious parts of running an ISP so you can focus on growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MikroTik RSC highlight */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="bg-sidebar rounded-2xl p-10 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-6">
            <Router className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-sidebar-foreground mb-4">
            Add MikroTik Routers in Seconds
          </h2>
          <p className="text-sidebar-accent-foreground max-w-xl mx-auto mb-8">
            Enter your router IP, username, and password. FASTANET generates a ready-to-paste
            RouterOS configuration script (.rsc file) tailored for your setup.
          </p>
          <Link href="/routers">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-router-cta">
              Manage Routers
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free, scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 border ${plan.highlight ? "bg-sidebar border-primary shadow-lg" : "bg-white"}`}
              >
                {plan.highlight && (
                  <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-sidebar-foreground" : "text-foreground"}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-sidebar-accent-foreground" : "text-muted-foreground"}`}>{plan.desc}</p>
                <div className={`text-3xl font-bold mb-6 ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                  {plan.price}<span className={`text-sm font-normal ${plan.highlight ? "text-sidebar-accent-foreground" : "text-muted-foreground"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-sidebar-foreground" : "text-foreground"}`}>
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className={`w-full ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 py-12 bg-sidebar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">FASTANET</span>
          </div>
          <p className="text-sidebar-accent-foreground text-sm">
            Built for African ISPs. Trusted across Kenya, Uganda, Tanzania & beyond.
          </p>
          <p className="text-sidebar-accent-foreground text-sm">
            support@fastanet.com
          </p>
        </div>
      </footer>
    </div>
  );
}
