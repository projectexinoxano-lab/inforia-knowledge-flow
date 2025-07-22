import DashboardHeader from "@/components/DashboardHeader";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-6 h-[calc(100vh-90px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Column - 65% width (8 out of 12 columns) */}
          <div className="col-span-8 flex items-center justify-center">
            <DayFocus />
          </div>

          {/* Right Column - 35% width (4 out of 12 columns) */}
          <div className="col-span-4 flex items-center justify-center -ml-8">
            <CalendarModule />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;