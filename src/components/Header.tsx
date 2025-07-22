
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="h-16 bg-card border-b border-module-border px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/">
          <h1 className="text-2xl font-serif font-semibold text-primary tracking-wide">
            iNFORiA
          </h1>
        </Link>
      </div>

      {/* Navigation Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-secondary transition-calm"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-module-border">
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            <Link to="/my-account" className="w-full">Mi Cuenta</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            <Link to="/faqs" className="w-full">FAQs</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            Configuración
          </DropdownMenuItem>
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            Ayuda
          </DropdownMenuItem>
          <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
