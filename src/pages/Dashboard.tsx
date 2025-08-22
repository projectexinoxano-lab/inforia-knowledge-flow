import { Header } from "@/components/Header";
import CalendarModule from "@/components/CalendarModule";
import { ReportModule } from "@/components/ReportModule";
import { SearchModule } from "@/components/SearchModule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Dashboard - Puesto de Mando Clínico */}
      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="inforia-h1 mb-2">Puesto de Mando Clínico</h1>
          <p className="inforia-body opacity-70">
            Tu centro de control profesional para la gestión de consulta
          </p>
        </div>

        {/* 50/50 Layout as specified */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          
          {/* LEFT BLOCK (50%) - Calendar Module */}
          <div className="flex flex-col">
            <Card className="flex-1 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="inforia-h3">Calendario & Agenda</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CalendarModule />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT BLOCK (50%) - Split Vertically */}
          <div className="flex flex-col space-y-6">
            
            {/* TOP MODULE (60% height) - Redactar Informe */}
            <div className="flex-[3]">
              <Card className="h-full border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="inforia-h3">Crear Nuevo Informe</CardTitle>
                  <p className="inforia-small">
                    Genera informes inteligentes con IA desde tus notas de sesión
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ReportModule />
                </CardContent>
              </Card>
            </div>

            {/* BOTTOM MODULE (40% height) - Búsqueda Universal */}
            <div className="flex-[2]">
              <Card className="h-full border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="inforia-h3">Buscar en Todo</CardTitle>
                  <p className="inforia-small">
                    Encuentra pacientes, informes y citas al instante
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <SearchModule />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}