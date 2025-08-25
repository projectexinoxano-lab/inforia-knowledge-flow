
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import SessionWorkspace from "./pages/SessionWorkspace";
import PatientDetailedProfile from "./pages/PatientDetailedProfile";
import PatientList from "./pages/PatientList";
import NewPatient from "./pages/NewPatient";
import MyAccount from "./pages/MyAccount";
import ReportWorkspace from '@/pages/ReportWorkspace';
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      } />
      <Route path="/session-workspace" element={
        <AuthGuard>
          <SessionWorkspace />
        </AuthGuard>
      } />
      <Route path="/patient-detailed-profile" element={
        <AuthGuard>
          <PatientDetailedProfile />
        </AuthGuard>
      } />
      <Route path="/patient-list" element={
        <AuthGuard>
          <PatientList />
        </AuthGuard>
      } />
      <Route path="/new-patient" element={
        <AuthGuard>
          <NewPatient />
        </AuthGuard>
      } />
      <Route path="/my-account" element={
        <AuthGuard>
          <MyAccount />
        </AuthGuard>
      } />
      <Route path="/faqs" element={
        <AuthGuard>
          <FAQs />
        </AuthGuard>
      } />
      <Route path="/reports/new" element={
        <AuthGuard>
          <ReportWorkspace />
        </AuthGuard>
      } />
      <Route path="/reports/new/:patientId" element={
        <AuthGuard>
          <ReportWorkspace />
        </AuthGuard>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
