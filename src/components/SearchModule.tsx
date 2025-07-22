import { useState } from "react";
import { Search, User, FileText, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const SearchModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults] = useState([
    {
      id: 1,
      type: "patient",
      title: "Ana María González",
      subtitle: "Paciente activo",
      icon: User,
      lastUpdate: "Hace 2 días"
    },
    {
      id: 2,
      type: "report",
      title: "Informe de evaluación inicial",
      subtitle: "Juan Carlos Pérez",
      icon: FileText,
      lastUpdate: "Hace 1 semana"
    },
    {
      id: 3,
      type: "appointment",
      title: "Sesión terapéutica",
      subtitle: "Hoy, 16:00",
      icon: Calendar,
      lastUpdate: "Programada"
    }
  ]);

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-module-background border-module-border p-6 rounded-xl">
      <h2 className="module-title mb-6">Búsqueda</h2>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente, informe o cita..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-module-border focus:ring-primary focus:border-primary font-sans bg-card"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => {
              const IconComponent = result.icon;
              return (
                <div
                  key={result.id}
                  className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-module-border hover:bg-secondary transition-calm cursor-pointer"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-foreground truncate">
                      {result.title}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="font-sans">{result.lastUpdate}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-sans text-sm">
                No se encontraron resultados para "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Searches or Quick Access */}
      {!searchQuery && (
        <div className="space-y-3">
          <h3 className="font-sans font-medium text-sm text-muted-foreground">
            Acceso rápido
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-module-border hover:bg-secondary transition-calm cursor-pointer">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-sans font-medium text-foreground">
                  Todos los pacientes
                </p>
                <p className="font-sans text-xs text-muted-foreground">
                  Ver lista completa
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-module-border hover:bg-secondary transition-calm cursor-pointer">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-sans font-medium text-foreground">
                  Informes recientes
                </p>
                <p className="font-sans text-xs text-muted-foreground">
                  Últimos 30 días
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};