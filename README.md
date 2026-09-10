# Tranqui Finanzas

Control de ingresos, gastos y disponible mensual — sin ansiedad, a tu ritmo.

## ✨ Funcionalidades

- Registro de ingresos y gastos por categoría (personalizables)
- Desglose de gastos por ítem/concepto
- Presupuestos por categoría con progreso visual
- Gráficos: distribución por categoría, resumen mensual, comparación entre meses
- Exportación de datos a CSV
- Selector de moneda de visualización (USD, EUR, MXN, COP, VES, ARS)
- Autenticación con correo/contraseña (Supabase Auth), incluyendo recuperación
  de contraseña
- Funciona offline: los datos se cachean en `localStorage` y se sincronizan
  con Supabase cuando hay conexión
- Instalable como PWA (Progressive Web App)

## 🛠️ Stack técnico

- React + Vite
- Tailwind CSS
- Supabase (Auth + Postgres)
- Recharts (gráficos)
- Lucide React (iconos)

## 🚀 Levantar el proyecto en local

```bash
npm install
```

Crea un archivo `.env.local` en la raíz (no lo subas a git) con:

```
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Luego:

```bash
npm run dev
```

## 📦 Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos finales (con nombres de
archivo hasheados por Vite). **No edites `dist/index.html` a mano** —
cualquier cambio ahí se pierde en el próximo build. Los cambios de
contenido/branding van en el `index.html` fuente de la raíz del proyecto.

## 🔒 Seguridad de datos

Los datos financieros se guardan en una tabla `monthlydata` en Supabase,
protegida con Row Level Security (RLS): cada usuario solo puede leer y
escribir su propia fila. Antes de desplegar a producción, verifica las
políticas RLS ejecutando las consultas de `RLS_SEGURIDAD.sql`.

## 📋 Pendientes conocidos (ver plan de proyecto)

- Integración de pagos (aún no implementada)
- Borrado de cuenta/datos desde la UI
- Conversión real de moneda (hoy el selector solo cambia el símbolo mostrado)
- Tests automatizados de los cálculos financieros

## 📄 Licencia / Legal

Términos de Servicio y Política de Privacidad en `/legal`. Revisar con
un abogado antes de cobrar a usuarios reales.

---

Desarrollado por Otto N. Manrique.