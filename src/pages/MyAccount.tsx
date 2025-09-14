// Ruta: src/pages/MyAccount.tsx (CORREGIR ESTRUCTURA)
import React, { useState, useEffect } from "react";
import { Save, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CreditsStatus } from '@/components/CreditsStatus';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyAccount = () => {
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para formulario con datos reales
  const [formData, setFormData] = useState({
    // Datos profesionales Y de facturación en un solo bloque
    full_name: '',
    professional_license: '',
    collegiate_number: '',
    clinic_name: '',
    specialties: '',
    phone: '',
    email: '',
    physical_address: '',
    billing_name: '',
    billing_email: '',
    tax_id: '',
    nif_dni: '',
    billing_address: '',
    billing_city: '',
    billing_postal_code: '',
    billing_country: ''
  });

  // Actualizar formData cuando cambie el profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        professional_license: profile.professional_license || '',
        collegiate_number: profile.collegiate_number || '',
        clinic_name: profile.clinic_name || '',
        specialties: profile.specialties || '',
        phone: profile.phone || '',
        email: profile.email || '',
        physical_address: profile.physical_address || '',
        billing_name: profile.billing_name || '',
        billing_email: profile.billing_email || '',
        tax_id: profile.tax_id || '',
        nif_dni: profile.nif_dni || '',
        billing_address: profile.billing_address || '',
        billing_city: profile.billing_city || '',
        billing_postal_code: profile.billing_postal_code || '',
        billing_country: profile.billing_country || 'España'
      });
    }
  }, [profile]);

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSaveChanges = async () => {
    // Validar campos obligatorios
    const requiredFields = {
      full_name: 'Nombre Completo',
      professional_license: 'Nº Colegiado',
      email: 'Email',
      physical_address: 'Dirección Física',
      billing_name: 'Nombre de Facturación',
      billing_email: 'Email de Facturación',
      tax_id: 'NIF/DNI'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        toast.error(`${label} es obligatorio`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <NavigationHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#2E403B]">Mi Cuenta</h1>
          <p className="text-[#333333]/70 font-sans mt-2">
            Gestiona tu perfil profesional y datos de facturación
          </p>
        </div>

        {/* Estado de Suscripción */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditsStatus />
          </div>
          
          <div className="lg:col-span-2">
            {/* Sistema de tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="professional" className="font-sans">
                  Mis Datos Profesionales
                </TabsTrigger>
                <TabsTrigger value="subscription" className="font-sans">
                  Suscripción y Facturación
                </TabsTrigger>
              </TabsList>

              {/* Tab: Datos Profesionales (TODO EN UNO) */}
              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Mis Datos Profesionales</CardTitle>
                    <CardDescription className="font-sans">
                      Gestiona tu información profesional y de contacto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Formulario unificado */}
                    <div className="grid gap-6">
                      {/* Datos básicos profesionales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name" className="font-sans text-sm font-medium">
                            Nombre Completo *
                          </Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange('full_name')}
                            className="font-sans"
                            placeholder="Dr. María González"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="professional_license" className="font-sans text-sm font-medium">
                            Nº de Colegiado *
                          </Label>
                          <Input
                            id="professional_license"
                            value={formData.professional_license}
                            onChange={handleInputChange('professional_license')}
                            className="font-sans"
                            placeholder="28-4567-89"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clinic_name" className="font-sans text-sm font-medium">
                            Nombre de la Consulta
                          </Label>
                          <Input
                            id="clinic_name"
                            value={formData.clinic_name}
                            onChange={handleInputChange('clinic_name')}
                            className="font-sans"
                            placeholder="Centro de Psicología Integral"
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialties" className="font-sans text-sm font-medium">
                            Especialidades
                          </Label>
                          <Input
                            id="specialties"
                            value={formData.specialties}
                            onChange={handleInputChange('specialties')}
                            className="font-sans"
                            placeholder="Psicología Clínica, Terapia Cognitiva"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="font-sans text-sm font-medium">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            className="font-sans"
                            placeholder="maria.gonzalez@email.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="font-sans text-sm font-medium">
                            Teléfono
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange('phone')}
                            className="font-sans"
                            placeholder="+34 600 000 000"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="physical_address" className="font-sans text-sm font-medium">
                          Dirección Física *
                        </Label>
                        <Textarea
                          id="physical_address"
                          value={formData.physical_address}
                          onChange={handleInputChange('physical_address')}
                          className="font-sans resize-none"
                          rows={3}
                          placeholder="Calle Ejemplo 123, 1º A&#10;28001 Madrid&#10;España"
                        />
                      </div>

                      {/* Datos de facturación integrados */}
                      <div className="border-t pt-6">
                        <h3 className="font-serif text-lg font-medium text-[#2E403B] mb-4">
                          Datos de Facturación
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="billing_name" className="font-sans text-sm font-medium">
                              Nombre para Facturación *
                            </Label>
                            <Input
                              id="billing_name"
                              value={formData.billing_name}
                              onChange={handleInputChange('billing_name')}
                              className="font-sans"
                              placeholder="María González Pérez"
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing_email" className="font-sans text-sm font-medium">
                              Email de Facturación *
                            </Label>
                            <Input
                              id="billing_email"
                              type="email"
                              value={formData.billing_email}
                              onChange={handleInputChange('billing_email')}
                              className="font-sans"
                              placeholder="facturacion@email.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="tax_id" className="font-sans text-sm font-medium">
                              NIF/DNI *
                            </Label>
                            <Input
                              id="tax_id"
                              value={formData.tax_id}
                              onChange={handleInputChange('tax_id')}
                              className="font-sans"
                              placeholder="12345678Z"
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing_country" className="font-sans text-sm font-medium">
                              País
                            </Label>
                            <Input
                              id="billing_country"
                              value={formData.billing_country}
                              onChange={handleInputChange('billing_country')}
                              className="font-sans"
                              placeholder="España"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billing_address" className="font-sans text-sm font-medium">
                            Dirección de Facturación
                          </Label>
                          <Textarea
                            id="billing_address"
                            value={formData.billing_address}
                            onChange={handleInputChange('billing_address')}
                            className="font-sans resize-none"
                            rows={2}
                            placeholder="Si es diferente a la dirección física"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="w-full font-sans bg-[#2E403B] hover:bg-[#2E403B]/90"
                    >
                      {isLoading ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Suscripción y Facturación */}
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Suscripción y Facturación</CardTitle>
                    <CardDescription className="font-sans">
                      Gestiona tu plan y descarga facturas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Funcionalidad de suscripción en desarrollo</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;