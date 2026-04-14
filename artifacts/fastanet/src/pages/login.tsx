import { Link, useLocation } from "wouter";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string; password: string }>();
  const { toast } = useToast();

  const onSubmit = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-sidebar p-12">
        <div className="flex items-center gap-2 mb-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">FASTANET</span>
        </div>
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-sidebar-foreground mb-4 leading-tight">
            Manage your ISP<br />like a pro.
          </h2>
          <p className="text-sidebar-accent-foreground text-lg">
            Routers, users, billing, payments — all in one powerful dashboard built for African ISPs.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-10">
            {[
              { v: "500+", l: "ISPs" },
              { v: "50K+", l: "Users managed" },
              { v: "KES 2M+", l: "Transactions" },
              { v: "99.9%", l: "Uptime" },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-bold text-primary">{s.v}</div>
                <div className="text-sm text-sidebar-accent-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FASTANET</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your ISP dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@isp.co.ke"
                {...register("email")}
                className="mt-1"
                data-testid="input-email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-submit-login"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register your ISP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
