
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SessionWorkspace from "./pages/SessionWorkspace";
import PatientDetailedProfile from "./pages/PatientDetailedProfile";
import PatientList from "./pages/PatientList";
import NewPatient from "./pages/NewPatient";
import MyAccount from "./pages/MyAccount";
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/session-workspace" element={<SessionWorkspace />} />
          <Route path="/patient-detailed-profile" element={<PatientDetailedProfile />} />
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/new-patient" element={<NewPatient />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/faqs" element={<FAQs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
