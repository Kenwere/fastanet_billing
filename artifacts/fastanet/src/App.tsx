import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard";
import RoutersPage from "@/pages/routers";
import UsersPage from "@/pages/users";
import PackagesPage from "@/pages/packages";
import VouchersPage from "@/pages/vouchers";
import PppoePage from "@/pages/pppoe";
import PaymentsPage from "@/pages/payments";
import SessionsPage from "@/pages/sessions";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    });
    setBaseUrl(import.meta.env.VITE_API_BASE_URL);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route component={LoginPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard">
        {() => <DashboardLayout><DashboardPage /></DashboardLayout>}
      </Route>
      <Route path="/routers">
        {() => <DashboardLayout><RoutersPage /></DashboardLayout>}
      </Route>
      <Route path="/users">
        {() => <DashboardLayout><UsersPage /></DashboardLayout>}
      </Route>
      <Route path="/packages">
        {() => <DashboardLayout><PackagesPage /></DashboardLayout>}
      </Route>
      <Route path="/vouchers">
        {() => <DashboardLayout><VouchersPage /></DashboardLayout>}
      </Route>
      <Route path="/pppoe">
        {() => <DashboardLayout><PppoePage /></DashboardLayout>}
      </Route>
      <Route path="/payments">
        {() => <DashboardLayout><PaymentsPage /></DashboardLayout>}
      </Route>
      <Route path="/sessions">
        {() => <DashboardLayout><SessionsPage /></DashboardLayout>}
      </Route>
      <Route path="/analytics">
        {() => <DashboardLayout><AnalyticsPage /></DashboardLayout>}
      </Route>
      <Route path="/settings">
        {() => <DashboardLayout><SettingsPage /></DashboardLayout>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
