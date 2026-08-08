# DreamTeam Finance — MVP

App de control de finanzas personales (ingresos, gastos, disponible por mes,
gráficos y detalle por conceptos). Este paquete ya trae 3 correcciones sobre
la versión que enviaste:

1. **Botones de resumen** (Ingresos/Gastos/Disponible) ahora van en **una sola
   fila**, con el mismo lenguaje visual que los botones "Anterior/Siguiente".
2. **Edición real de items/conceptos** dentro de un gasto (antes solo se podía
   borrar y volver a escribir).
3. **Persistencia con localStorage**: los datos ya no se pierden al cerrar el
   navegador.

## 1. Abrir el proyecto en VS Code

```bash
cd dreamteam-finance
code .
```

## 2. Instalar dependencias y correr en local

```bash
npm install
npm run dev
```

Abre la URL que te muestra la terminal (normalmente `http://localhost:5173`).

## 3. Guardarlo en Git local

```bash
git init
git add .
git commit -m "MVP DreamTeam Finance - v0.2 con localStorage y fixes"
```

## 4. Subirlo a GitHub

1. Crea un repositorio vacío en GitHub (sin README, sin licencia).
2. Conéctalo y sube tu código:

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/dreamteam-finance.git
git push -u origin main
```

## 5. Desplegar en Vercel (cuando estés listo)

1. Entra a vercel.com con tu cuenta de GitHub.
2. "Add New Project" → selecciona el repo `dreamteam-finance`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Deploy. En minutos tienes una URL pública.

## 6. Cuándo pasar a Firebase (no antes)

Mientras la app viva solo en tu navegador (localStorage), es de un solo
usuario y un solo dispositivo — perfecta para validar el MVP contigo mismo.
El día que quieras venderla a otras personas necesitas, como mínimo:

- **Auth** (login por email o Google) para que cada quien vea solo sus datos.
- **Base de datos en la nube** (Firestore, o Supabase/Postgres) para que los
  datos sobrevivan a un cambio de dispositivo o borrar caché.
- **Reglas de seguridad** para que un usuario no pueda leer los datos de otro.

No lo hagas antes de tener el flujo de captura pulido: es trabajo de backend
que no cambia si el usuario logra registrar un gasto en 5 segundos o en 30.
