import { useListOrganizations, useUpdateOrganization, getListOrganizationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

type SettingsForm = {
  name: string;
  phone: string;
  primaryColor: string;
  welcomeMessage: string;
  loginStyle: string;
  paymentMethods: string;
};

export default function SettingsPage() {
  const { data: orgs, isLoading } = useListOrganizations();
  const org = orgs?.[0];
  const updateOrg = useUpdateOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (org) {
      reset({
        name: org.name,
        phone: org.phone ?? "",
        primaryColor: org.primaryColor,
        welcomeMessage: org.welcomeMessage ?? "",
        loginStyle: org.loginStyle,
        paymentMethods: org.paymentMethods,
      });
    }
  }, [org, reset]);

  const onSubmit = async (data: SettingsForm) => {
    if (!org) return;
    await updateOrg.mutateAsync({
      id: org.id,
      data: {
        name: data.name,
        phone: data.phone || null,
        primaryColor: data.primaryColor,
        welcomeMessage: data.welcomeMessage || null,
        loginStyle: data.loginStyle as "voucher" | "phone" | "pppoe",
        paymentMethods: data.paymentMethods,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListOrganizationsQueryKey() });
    toast({ title: "Settings saved", description: "Your ISP settings have been updated" });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
      </div>
    );
  }

  if (!org) {
    return <div className="text-muted-foreground">No organization found</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">ISP Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your ISP organization and portal settings</p>
      </div>

      {/* Org info */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">{org.name}</div>
            <div className="text-sm text-muted-foreground">{org.subdomain}.fastanet.com · {org.ownerEmail}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ISP Name</Label>
              <Input {...register("name")} className="mt-1" data-testid="input-settings-name" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="+254700000000" className="mt-1" data-testid="input-settings-phone" />
            </div>
          </div>

          <div>
            <Label>Welcome Message</Label>
            <Textarea {...register("welcomeMessage")} placeholder="Welcome to our internet service..." className="mt-1" rows={3} data-testid="input-settings-welcome" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Portal Login Style</Label>
              <Select onValueChange={(v) => setValue("loginStyle", v)} defaultValue={org.loginStyle}>
                <SelectTrigger className="mt-1" data-testid="select-settings-login-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="pppoe">PPPoE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="color" {...register("primaryColor")} className="w-12 h-10 p-1 cursor-pointer" data-testid="input-settings-color" />
                <Input {...register("primaryColor")} className="flex-1" placeholder="#f5c542" data-testid="input-settings-color-text" />
              </div>
            </div>
          </div>

          <div>
            <Label>Active Payment Methods</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Comma-separated list of enabled gateways</p>
            <Input {...register("paymentMethods")} placeholder="mpesa,paystack,pesapal" className="mt-1" data-testid="input-settings-payment-methods" />
            <div className="flex flex-wrap gap-2 mt-2">
              {["mpesa", "paystack", "pesapal", "intasend"].map(gw => (
                <span key={gw} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{gw}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={updateOrg.isPending} data-testid="button-save-settings">
              {updateOrg.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>

      {/* Subdomain info */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold mb-3">Your Captive Portal URL</h3>
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <code className="text-sm flex-1 font-mono">{org.subdomain}.fastanet.com</code>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${org.subdomain}.fastanet.com`); }}>
            Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Share this URL with your customers to connect to your hotspot portal</p>
      </div>
    </div>
  );
}
