import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AdminView from "@/pages/AdminView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SinglePageCalendar from "@/pages/SinglePageCalendar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SinglePageCalendar} />
      <Route path="/admin" component={AdminView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow">
          <Router />
        </div>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
