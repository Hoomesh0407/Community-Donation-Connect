import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
import { useSSENotifications } from "@/hooks/useSSENotifications";
import NotFound from "@/pages/not-found";

import LanguageSelect from "@/pages/language-select";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Donations from "@/pages/donations";
import Requests from "@/pages/requests";
import Matches from "@/pages/matches";
import Leaderboard from "@/pages/leaderboard";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Donate from "@/pages/donate";
import RequestItem from "@/pages/request";
import DonationDetail from "@/pages/donation-detail";
import RequestDetail from "@/pages/request-detail";

const queryClient = new QueryClient();

function SSEBridge() {
  useSSENotifications();
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LanguageSelect} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/donations" component={Donations} />
      <Route path="/donations/:id" component={DonationDetail} />
      <Route path="/requests" component={Requests} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/matches" component={Matches} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/donate" component={Donate} />
      <Route path="/request" component={RequestItem} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <SSEBridge />
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
