// Ruta: src/components/Header.tsx
// REEMPLAZAR TODO EL CONTENIDO con este código completo:

import { Search, Menu, UserCircle, Calendar, Users, Plus, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-serif font-medium text-foreground tracking-wide">
            iNFORiA
          </h1>
        </Link>
      </div>

      {/* Search Bar - Center */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes, informes..."
            className="pl-10 bg-muted/50 border-border focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Navigation Icons & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Main Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border-border">
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/" className="w-full flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/patient-list" className="w-full flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Pacientes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/new-patient" className="w-full flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Crear Ficha de Paciente
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/session-workspace" className="w-full flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Sesión
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/faqs" className="w-full flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <Avatar className="h-8 w-8">
                {user?.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border">
            <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted">
              <Link to="/my-account" className="w-full flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Mi Cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-muted focus:bg-muted text-destructive focus:text-destructive" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}