import DashboardHeader from "@/components/DashboardHeader";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-10 gap-8">
          {/* Left Column - 70% width (7 out of 10 columns) */}
          <div className="col-span-7">
            <DayFocus />
          </div>

          {/* Right Column - 30% width (3 out of 10 columns) */}
          <div className="col-span-3">
            <CalendarModule />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;