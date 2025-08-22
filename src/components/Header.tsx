import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Bell, Settings, LogOut, User, CreditCard, Search, Menu, Calendar, Users, Plus, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-card border-b border-module-border h-20 px-8 flex items-center justify-between animate-fade-in shadow-sm">
      {/* Logo & Brand */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:opacity-80 transition-calm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-inforia rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-inforia-foreground font-bold text-lg font-serif">iN</span>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-inforia">
                iNFORiA
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Asistente Clínico IA
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Barra de Búsqueda Global */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Buscar paciente, informe, cita..."
            className="pl-12 pr-4 py-3 bg-background border-module-border focus:border-inforia transition-calm font-sans rounded-lg"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-3">
        {/* Status Badge */}
        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 hidden sm:flex">
          <div className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></div>
          Plan Profesional
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-inforia/10 hover:text-inforia">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-burgundy rounded-full"></span>
        </Button>

        {/* Navigation Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-inforia/10 hover:text-inforia">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <Link to="/">
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/patient-list">
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Mis Pacientes</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/new-patient">
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                <span>Nuevo Paciente</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/faqs">
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>FAQs</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-inforia/10">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar" />
                <AvatarFallback className="bg-inforia text-inforia-foreground text-sm">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/my-account">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mi Cuenta</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Facturación</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-burgundy focus:text-burgundy-foreground focus:bg-burgundy">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};