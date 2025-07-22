
import MainDashboard from "@/components/MainDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MainDashboard />
      
      {/* Navigation Links for Testing */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Link to="/session-workspace">
          <Button variant="outline" size="sm">
            Registro de Sesión
          </Button>
        </Link>
        <Link to="/my-account">
          <Button variant="outline" size="sm">
            Mi Cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
