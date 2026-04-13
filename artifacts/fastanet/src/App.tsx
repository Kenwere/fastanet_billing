import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
