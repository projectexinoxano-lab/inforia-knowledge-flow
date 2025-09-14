// Ruta: src/pages/MyAccount.tsx (actualizar TabsContent subscription)
import React, { useState } from "react";
import { Camera, Download, CreditCard, AlertCircle, CheckCircle, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CreditsStatus } from '@/components/CreditsStatus';
import { PricingCards } from '@/components/PricingCards';
import { BillingSection } from '@/components/BillingSection';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("professional");
  const { user, profile } = useAuth();
  const { createCheckoutSession, loading: checkoutLoading } = useStripeCheckout();

  // Mock data - en producción vendría de la base de datos
  const mockUser = {
    name: "Dr. María González",
    collegiateNumber: "28-4567-89",
    clinicName: "Centro de Psicología Integral",
    email: "maria.gonzalez@email.com",
    currentPlan: "professional" as const,
    planName: "Plan Profesional",
    reportsUsed: 34,
    reportsTotal: 100,
    nextBillingDate: "15 de enero de 2025",
    subscriptionStatus: "active" as const,
    subscriptionId: "sub_1234567890",
    customerId: "cus_1234567890"
  };

  const mockInvoices = [
    { 
      id: "inv_001", 
      number: "INV-2024-001", 
      date: "2024-12-01", 
      amount: 99, 
      status: "paid" as const, 
      plan: "Plan Profesional",
      downloadUrl: "/api/invoices/inv_001.pdf"
    },
    { 
      id: "inv_002", 
      number: "INV-2024-002", 
      date: "2024-11-01", 
      amount: 99, 
      status: "paid" as const, 
      plan: "Plan Profesional",
      downloadUrl: "/api/invoices/inv_002.pdf"
    },
    { 
      id: "inv_003", 
      number: "INV-2024-003", 
      date: "2024-10-01", 
      amount: 99, 
      status: "paid" as const, 
      plan: "Plan Profesional",
      downloadUrl: "/api/invoices/inv_003.pdf"
    }
  ];

  const usagePercentage = (mockUser.reportsUsed / mockUser.reportsTotal) * 100;
  const canRenewEarly = usagePercentage >= 80;

  // Manejar selección de plan
  const handlePlanSelect = async (planId: 'professional' | 'clinic') => {
    if (!user?.id) {
      toast.error('Debes estar autenticado para cambiar de plan');
      return;
    }

    if (planId === mockUser.currentPlan) {
      toast.info('Ya tienes este plan activo');
      return;
    }

    try {
      const session = await createCheckoutSession(planId, user.id, user.email);
      
      // Redirigir a Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No se pudo generar la URL de checkout');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
    }
  };

  // Manejar renovación anticipada
  const handleEarlyRenewal = async () => {
    try {
      const session = await createCheckoutSession(mockUser.currentPlan, user!.id, user!.email);
      
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No se pudo generar la URL de renovación');
      }
    } catch (error) {
      console.error('Error en renovación anticipada:', error);
      toast.error('Error al procesar la renovación. Inténtalo de nuevo.');
    }
  };

  // Manejar descarga de factura
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      toast.info('Descargando factura...');
      
      const response = await fetch(`/api/stripe/download-invoice/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar la factura');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Factura descargada correctamente');
    } catch (error) {
      console.error('Error descargando factura:', error);
      toast.error('Error al descargar la factura');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <NavigationHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-lora font-bold text-[#2E403B]">Mi Cuenta</h1>
          <p className="text-[#333333]/70 font-nunito-sans mt-2">
            Gestiona tu perfil, suscripción y configuración
          </p>
        </div>

        {/* Estado de Suscripción */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditsStatus />
          </div>
          
          <div className="lg:col-span-2">
            {/* Información rápida de suscripción */}
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-xl text-[#2E403B]">
                      {mockUser.planName}
                    </CardTitle>
                    <CardDescription className="font-nunito-sans">
                      Próxima facturación: {mockUser.nextBillingDate}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 font-nunito-sans"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-nunito-sans text-[#333333]/70">
                    Informes utilizados
                  </span>
                  <span className="font-nunito-sans font-medium">
                    {mockUser.reportsUsed} / {mockUser.reportsTotal}
                  </span>
                </div>
                <Progress value={usagePercentage} className="mt-2 h-2" />
                
                {canRenewEarly && (
                  <Alert className="mt-4 border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="font-nunito-sans text-amber-800">
                      Has usado el 80% de tus informes. 
                      <Button 
                        variant="link" 
                        className="h-auto p-0 ml-1 text-amber-800 font-medium"
                        onClick={handleEarlyRenewal}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? 'Procesando...' : 'Renovar ahora'}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sistema de tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="professional" className="font-nunito-sans">
              Mis Datos Profesionales
            </TabsTrigger>
            <TabsTrigger value="security" className="font-nunito-sans">
              Cuenta y Seguridad
            </TabsTrigger>
            <TabsTrigger value="subscription" className="font-nunito-sans">
              Suscripción y Facturación
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Mis Datos Profesionales */}
          <TabsContent value="professional">
            {/* Mantener contenido existente */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-[#2E403B]">Mis Datos Profesionales</CardTitle>
                <CardDescription className="font-nunito-sans">
                  Gestiona tu información profesional y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contenido existente del perfil profesional */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Cuenta y Seguridad */}
          <TabsContent value="security">
            {/* Mantener contenido existente */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-[#2E403B]">Seguridad de la Cuenta</CardTitle>
                <CardDescription className="font-nunito-sans">
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contenido existente de seguridad */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Suscripción y Facturación - ACTUALIZADO */}
          <TabsContent value="subscription">
            <div className="space-y-8">
              {/* Estado actual de la suscripción */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-[#2E403B] flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Mi Suscripción Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="font-nunito-sans text-sm text-[#333333]/70">Plan</Label>
                      <p className="font-serif text-lg font-medium text-[#2E403B]">
                        {mockUser.planName}
                      </p>
                    </div>
                    <div>
                      <Label className="font-nunito-sans text-sm text-[#333333]/70">
                        Próxima Facturación
                      </Label>
                      <p className="font-nunito-sans text-lg font-medium text-[#333333]">
                        {mockUser.nextBillingDate}
                      </p>
                    </div>
                    <div>
                      <Label className="font-nunito-sans text-sm text-[#333333]/70">Estado</Label>
                      <Badge className="bg-green-100 text-green-800 font-nunito-sans">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Suscripción Activa
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#2E403B]/5 rounded-lg border border-[#2E403B]/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-nunito-sans text-[#333333]/70">Informes utilizados este mes</span>
                      <span className="font-nunito-sans font-medium text-[#2E403B]">
                        {mockUser.reportsUsed} / {mockUser.reportsTotal}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-3" />
                    
                    {canRenewEarly && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-nunito-sans text-sm text-amber-800">
                              Pocos informes disponibles
                            </span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={handleEarlyRenewal}
                            disabled={checkoutLoading}
                            className="bg-[#2E403B] hover:bg-[#2E403B]/90 font-nunito-sans"
                          >
                            {checkoutLoading ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              'Renovar Plan'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tarjetas de planes disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-[#2E403B]">Cambiar de Plan</CardTitle>
                  <CardDescription className="font-nunito-sans">
                    Selecciona el plan que mejor se adapte a tus necesidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingCards
                    currentPlan={mockUser.currentPlan}
                    onPlanSelect={handlePlanSelect}
                    showCurrentPlan={true}
                  />
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-serif font-medium text-blue-900 mb-1">
                          Cambio de plan instantáneo
                        </h4>
                        <p className="font-nunito-sans text-sm text-blue-800">
                          Al cambiar de plan, se ajustará el precio de forma proporcional y 
                          tu cuota de informes se actualizará inmediatamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de facturas */}
              <BillingSection
                currentPlan={mockUser.currentPlan}
                nextBillingDate={mockUser.nextBillingDate}
                invoices={mockInvoices}
                onDownloadInvoice={handleDownloadInvoice}
                onEarlyRenewal={handleEarlyRenewal}
                canRenewEarly={canRenewEarly}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyAccount;