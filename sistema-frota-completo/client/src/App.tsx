import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
import MotoristaPage from "./pages/MotoristaPage";
import VeiculoPage from "./pages/VeiculoPage";
import RotaPage from "./pages/RotaPage";
import EntregaPage from "./pages/EntregaPage";
import { isDesktop } from "react-device-detect";

function Router() {
  return (
    <Switch>
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/motoristas" component={MotoristaPage} />
      <Route path="/veiculos" component={VeiculoPage} />
      <Route path="/rotas" component={RotaPage} />
      <Route path="/entregas" component={EntregaPage} />
      <Route path="/" component={isDesktop ? DashboardPage : RotaPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
