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
  Users,
  FileText,
  HelpCircle
} from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-primary border-b border-primary/10 sticky top-0 z-50 h-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-full">
          
          {/* INFORIA Logo - Exact Brand Positioning */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gold rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm font-serif">i</span>
              </div>
              <span className="text-xl font-serif font-semibold text-primary-foreground tracking-tight">
                iNFORiA
              </span>
            </div>
          </div>

          {/* Clean Navigation - No redundant elements */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:text-gold hover:bg-primary/20 font-sans font-medium"
              onClick={() => window.location.href = '/'}
            >
              Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:text-gold hover:bg-primary/20 font-sans font-medium"
              onClick={() => window.location.href = '/patient-list'}
            >
              Pacientes
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:text-gold hover:bg-primary/20 font-sans font-medium"
              onClick={() => window.location.href = '/session-workspace'}
            >
              Nueva Sesión
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:text-gold hover:bg-primary/20 font-sans font-medium"
              onClick={() => window.location.href = '/faqs'}
            >
              Ayuda
            </Button>
          </nav>

          {/* User Menu - INFORIA Brand Styling */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground hover:text-gold font-sans">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gold rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
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
                
                <DropdownMenuItem onClick={signOut} className="text-destructive">
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