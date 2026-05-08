# Drummond Confort - Sistema de Mantenimiento

Sistema integral de gestión, control de mantenimiento de equipos, flujos de garantías y generación de reportes. Diseñado para ser una aplicación robusta, segura y con soporte de Progressive Web App (PWA) para accesibilidad en dispositivos móviles.

## 🚀 Características Principales

- **Gestión de Mantenimiento y Garantías:** Flujo de trabajo interactivo para cambiar los estados de los camiones y gestionar ciclos de vida de garantías, asegurando la trazabilidad de reingresos.
- **Autenticación y Seguridad Estricta:** Integración con **Supabase**, utilizando políticas de seguridad a nivel de fila (Row-Level Security - RLS) para proteger la integridad de los reportes y registros de la base de datos.
- **Generación de Reportes PDF:** Creación de informes detallados con logos corporativos, manejo de tablas dinámicas de fallas, seguridad, fatiga y divulgación PTS mediante `jspdf` y `jspdf-autotable`.
- **Exportación de Datos:** Descarga ágil de la información en formato Excel (`xlsx`).
- **Progressive Web App (PWA):** Soporte completo PWA (vía `manifest.json` y service workers) para instalación offline y mejor experiencia de usuario en móviles.

## 🛠️ Tecnologías y Stack

- **Framework Core:** React 19 + Vite.
- **Iconografía e Interfaz:** Lucide React.
- **Backend as a Service (BaaS):** Supabase (Autenticación, PostgreSQL, Storage).
- **Procesamiento de Documentos:** `jspdf`, `jspdf-autotable`, `xlsx`.

## 📦 Instalación y Configuración

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   git clone <url-del-repositorio>
   cd drummond-confort
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Configuración de Entorno:**
   Debes asegurar la conexión con Supabase. Crea un archivo `.env` o `.env.local` en la raíz del proyecto y agrega tus credenciales:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase_aqui
   VITE_SUPABASE_ANON_KEY=tu_key_anonima_de_supabase_aqui
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🏗️ Construcción para Producción

Para generar el build optimizado para entornos de producción (ej. Vercel):
```bash
npm run build
```
Para probar la compilación de producción en tu máquina local:
```bash
npm run preview
```

## 🔒 Notas sobre Seguridad (Supabase RLS)

La base de datos (como la tabla `camiones` y reportes) está protegida mediante restricciones de Row-Level Security. Asegúrese de que las interacciones desde el frontend siempre cumplan con los perfiles de usuario autenticados para evitar denegación de persistencia de datos o violaciones de restricciones (WSoD evitado por persistencia de sesión controlada).
