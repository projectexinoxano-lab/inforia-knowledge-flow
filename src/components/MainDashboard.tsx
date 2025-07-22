import DashboardHeader from "@/components/DashboardHeader";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="h-[calc(100vh-90px)] flex items-center justify-center px-6">
        <div className="max-w-7xl w-full flex gap-8 items-center justify-center">
          {/* Left Module - Foco del Día */}
          <div className="flex-1 max-w-4xl">
            <DayFocus />
          </div>

          {/* Right Module - Calendar */}
          <div className="w-96 flex-shrink-0">
            <CalendarModule />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;