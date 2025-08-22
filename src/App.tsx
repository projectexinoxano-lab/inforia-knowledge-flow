
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainDashboard from "./components/MainDashboard";
import Auth from "./pages/Auth";
import SessionWorkspace from "./pages/SessionWorkspace";
import PatientDetailedProfile from "./pages/PatientDetailedProfile";
import PatientList from "./pages/PatientList";
import NewPatient from "./pages/NewPatient";
import MyAccount from "./pages/MyAccount";
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-inforia"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <MainDashboard />
        </ProtectedRoute>
      } />
      <Route path="/session-workspace" element={
        <ProtectedRoute>
          <SessionWorkspace />
        </ProtectedRoute>
      } />
      <Route path="/patient-detailed-profile" element={
        <ProtectedRoute>
          <PatientDetailedProfile />
        </ProtectedRoute>
      } />
      <Route path="/patient-list" element={
        <ProtectedRoute>
          <PatientList />
        </ProtectedRoute>
      } />
      <Route path="/new-patient" element={
        <ProtectedRoute>
          <NewPatient />
        </ProtectedRoute>
      } />
      <Route path="/my-account" element={
        <ProtectedRoute>
          <MyAccount />
        </ProtectedRoute>
      } />
      <Route path="/faqs" element={
        <ProtectedRoute>
          <FAQs />
        </ProtectedRoute>
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
