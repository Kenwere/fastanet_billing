import { Link, useLocation } from "wouter";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

type RegisterForm = {
  ispName: string;
  subdomain: string;
  ownerName: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit } = useForm<RegisterForm>();

  const onSubmit = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">FASTANET</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Register your ISP</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Get your ISP management dashboard up and running in minutes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="ispName">ISP Name</Label>
            <Input
              id="ispName"
              placeholder="SpeedLink ISP"
              {...register("ispName")}
              className="mt-1"
              data-testid="input-isp-name"
            />
          </div>
          <div>
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex mt-1">
              <Input
                id="subdomain"
                placeholder="speedlink"
                {...register("subdomain")}
                className="rounded-r-none"
                data-testid="input-subdomain"
              />
              <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                .fastanet.com
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="ownerName">Your Name</Label>
            <Input
              id="ownerName"
              placeholder="John Kamau"
              {...register("ownerName")}
              className="mt-1"
              data-testid="input-owner-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@speedlink.co.ke"
              {...register("email")}
              className="mt-1"
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="mt-1"
              data-testid="input-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-submit-register"
          >
            Create ISP Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
