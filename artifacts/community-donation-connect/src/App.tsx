import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LanguageSelect} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/donations" component={Donations} />
      <Route path="/requests" component={Requests} />
      <Route path="/matches" component={Matches} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile/:id" component={Profile} />
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
