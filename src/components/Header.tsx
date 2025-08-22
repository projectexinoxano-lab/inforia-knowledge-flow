import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Menu,
  Users,
  FileText,
  HelpCircle,
  Calendar
} from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-[#2E403B] border-b border-[#2E403B]/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <span className="text-[#2E403B] font-bold text-sm font-lora">i</span>
              </div>
              <span className="text-xl font-lora font-bold text-white">
                iNFORiA
              </span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-white hover:text-[#D4AF37] hover:bg-[#2E403B]/20 font-nunito-sans"
              onClick={() => window.location.href = '/'}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-white hover:text-[#D4AF37] hover:bg-[#2E403B]/20 font-nunito-sans"
              onClick={() => window.location.href = '/patient-list'}
            >
              <Users className="mr-2 h-4 w-4" />
              Pacientes
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-white hover:text-[#D4AF37] hover:bg-[#2E403B]/20 font-nunito-sans"
              onClick={() => window.location.href = '/session-workspace'}
            >
              <FileText className="mr-2 h-4 w-4" />
              Nueva Sesión
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-white hover:text-[#D4AF37] hover:bg-[#2E403B]/20 font-nunito-sans"
              onClick={() => window.location.href = '/faqs'}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
          </nav>

          {/* Menú de Usuario */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-[#D4AF37]">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                      <span className="text-[#2E403B] text-sm font-semibold">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-nunito-sans">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/my-account'}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Cuenta
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="md:hidden"
                  onClick={() => window.location.href = '/patient-list'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Pacientes
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="md:hidden"
                  onClick={() => window.location.href = '/session-workspace'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Nueva Sesión
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="md:hidden"
                  onClick={() => window.location.href = '/faqs'}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}