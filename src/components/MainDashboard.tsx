import { Header } from "@/components/Header";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";
import { ReportModule } from "@/components/ReportModule";
import { SearchModule } from "@/components/SearchModule";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Principal con navegación e identidad de marca */}
      <Header />

      {/* Puesto de Mando Clínico - Layout principal */}
      <main className="h-[calc(100vh-80px)] grid grid-cols-12 gap-6 p-6">
        {/* Columna Izquierda - Foco del Día (60% width) */}
        <div className="col-span-7">
          <DayFocus />
        </div>

        {/* Columna Central - Calendario (25% width) */}
        <div className="col-span-3">
          <CalendarModule />
        </div>

        {/* Columna Derecha - Módulos de Acción (15% width) */}
        <div className="col-span-2 space-y-6">
          {/* Módulo de Redacción de Informes */}
          <div className="h-[48%]">
            <ReportModule />
          </div>
          
          {/* Módulo de Búsqueda */}
          <div className="h-[48%]">
            <SearchModule />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;