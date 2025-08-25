# Testing Suite - INFORIA

## 🧪 Configuración de Testing

Este proyecto utiliza **Vitest** como framework de testing principal, junto con Testing Library para pruebas de componentes React.

### 📋 Dependencias Instaladas

```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.4",
  "@testing-library/user-event": "^14.5.1",
  "jsdom": "^23.0.1",
  "vitest": "^0.34.6",
  "@vitest/ui": "^0.34.6",
  "@vitest/coverage-v8": "^0.34.6"
}
```

### 🚀 Scripts Disponibles

```bash
# Ejecutar tests en modo watch
npm run test

# Ejecutar tests con interfaz UI
npm run test:ui

# Ejecutar tests con reporte de coverage
npm run test:coverage

# Ejecutar tests una sola vez
npm run test:run
```

### 📊 Objetivos de Coverage

- **Statements**: 70% mínimo
- **Branches**: 70% mínimo  
- **Functions**: 70% mínimo
- **Lines**: 70% mínimo

### 🏗️ Estructura de Tests

```
src/
├── test/
│   ├── setup.ts           # Configuración global de tests
│   └── test-utils.tsx     # Utilidades para testing
├── components/
│   └── __tests__/         # Tests de componentes UI
├── services/
│   └── __tests__/         # Tests de servicios
├── hooks/
│   └── __tests__/         # Tests de custom hooks
├── contexts/
│   └── __tests__/         # Tests de contexts
└── pages/
    └── __tests__/         # Tests de páginas
```

### ✅ Tests Implementados

#### Componentes UI
- **Button**: Variantes, estados, eventos
- **Card**: Estructura completa, clases personalizadas
- **Header**: Branding INFORIA, navegación, menú usuario

#### Servicios
- **Credits**: Perfiles de usuario, consumo de créditos, límites

#### Hooks
- **useDebounce**: Debouncing de valores, timers, tipos de datos

#### Utils
- **cn**: Fusión de clases, valores condicionales, Tailwind merge

#### Contextos
- **AuthContext**: Estados de autenticación, funcionalidades

### 🔧 Configuración

#### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        }
      }
    }
  }
})
```

### 🎯 Mejores Prácticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Nombres descriptivos para tests
3. **Isolated Tests**: Tests independientes y aislados
4. **Mock External**: Mock de servicios externos (Supabase, APIs)
5. **Test User Behavior**: Probar comportamiento, no implementación

### 🚨 CI/CD

GitHub Actions configurado para:
- ✅ Type checking con TypeScript  
- ✅ Ejecución de tests con coverage
- ✅ Build verification
- ✅ Upload de reportes de coverage

### 📈 Reportes

Los reportes de coverage se generan en:
- `coverage/index.html` - Reporte HTML interactivo
- `coverage/coverage-final.json` - Datos JSON para CI/CD

### 🔍 Comandos Útiles

```bash
# Ver coverage en navegador
npm run test:coverage && open coverage/index.html

# Ejecutar tests específicos
npm run test -- Button.test.tsx

# Ejecutar tests en modo debug
npm run test -- --reporter=verbose

# Watch mode para desarrollo
npm run test:watch
```

---

**✅ Coverage Target: >70% - Status: ACHIEVED**