import { Header } from '@/components/Header';
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, FileText, UserPlus, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título Principal */}
        <div className="mb-8">
          <h1 className="text-3xl font-lora font-bold text-[#2E403B] mb-2">
            Puesto de Mando Clínico
          </h1>
          <p className="text-[#333333]/70 font-nunito-sans">
            Gestiona tu consulta de manera eficiente desde un solo lugar
          </p>
        </div>

        {/* Layout Principal: Foco del día + Calendario UNIFICADO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA 1: Foco del día */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#2E403B] font-lora">
                  <Calendar className="mr-2 h-5 w-5" />
                  Foco del Día
                </CardTitle>
                <CardDescription className="font-nunito-sans">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DayFocus />
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA 2: Calendario */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#2E403B] font-lora">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Calendario Mensual
                </CardTitle>
                <CardDescription className="font-nunito-sans">
                  Programación de citas y agenda general
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarModule />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Accesos Rápidos Simplificados */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2E403B] font-lora">Acciones Principales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => window.location.href = '/session-workspace'}
                  className="h-16 bg-[#2E403B] hover:bg-[#800020] text-white font-nunito-sans"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Nueva Sesión
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/new-patient'}
                  className="h-16 bg-[#800020] hover:bg-[#2E403B] text-white font-nunito-sans"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Nuevo Paciente
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/patient-list'}
                  className="h-16 bg-[#D4AF37] hover:bg-[#2E403B] text-white font-nunito-sans"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Ver Pacientes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;