# SYM LAB — Portal de Ideas I+D+i

Aplicación web instalable (PWA) para recopilar propuestas de innovación, investigación y desarrollo tecnológico. Las ideas se guardan automáticamente en un archivo Excel `.xlsx` y se notifican por correo Outlook.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Configuración de variables de entorno](#3-configuración-de-variables-de-entorno)
4. [Configurar el correo Outlook](#4-configurar-el-correo-outlook)
5. [Ejecutar en local](#5-ejecutar-en-local)
6. [Acceder al panel de administración](#6-acceder-al-panel-de-administración)
7. [Dónde se guarda el Excel](#7-dónde-se-guarda-el-excel)
8. [Instalar como app en móvil y escritorio (PWA)](#8-instalar-como-app-en-móvil-y-escritorio-pwa)
9. [Empaquetar como app de escritorio con Electron / Tauri](#9-empaquetar-como-app-de-escritorio-con-electron--tauri)
10. [Añadir imágenes de marca](#10-añadir-imágenes-de-marca)
11. [Despliegue en producción](#11-despliegue-en-producción)
12. [Seguridad y RGPD](#12-seguridad-y-rgpd)
13. [Alternativa profesional: Microsoft Graph API](#13-alternativa-profesional-microsoft-graph-api)
14. [Próximos pasos y evolución](#14-próximos-pasos-y-evolución)

---

## 1. Requisitos previos

- **Node.js 18 o superior** → Descarga en https://nodejs.org (elige "LTS")
- **npm** (viene incluido con Node.js)
- Una cuenta de correo **Outlook o Microsoft 365** para enviar notificaciones

Verifica que Node.js esté instalado abriendo el terminal y escribiendo:
```bash
node --version
npm --version
```

---

## 2. Instalación

Abre el terminal dentro de la carpeta `sym-lab` y ejecuta:

```bash
npm install
```

Esto descargará todas las dependencias (puede tardar 1-2 minutos la primera vez).

---

## 3. Configuración de variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   # En Windows:
   copy .env.local.example .env.local

   # En Mac/Linux:
   cp .env.local.example .env.local
   ```

2. Abre `.env.local` con un editor de texto (Bloc de notas, VS Code, etc.)

3. Rellena los valores (ver sección 4 para el correo):

```env
# Servidor SMTP de Outlook
SMTP_HOST=smtp.office365.com      # Para cuentas de empresa Microsoft 365
# SMTP_HOST=smtp-mail.outlook.com  # Para cuentas personales @outlook.com, @hotmail.com

SMTP_PORT=587
SMTP_USER=tucorreo@empresa.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# Dónde se recibirán los emails con las ideas
EMAIL_DESTINO=innovacion@empresa.com

# Contraseña del panel de administración (¡cámbiala!)
ADMIN_PASSWORD=MiContraseñaSegura123

# Token de sesión — genera uno con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SECRET_TOKEN=pega_aqui_el_token_generado
```

---

## 4. Configurar el correo Outlook

### Opción A — Cuenta personal Outlook (@outlook.com, @hotmail.com)

1. Ve a https://account.microsoft.com/security
2. Activa la **verificación en dos pasos** (obligatorio)
3. Ve a "Seguridad avanzada" → "Contraseñas de aplicación"
4. Crea una nueva contraseña de aplicación llamada "SYM LAB"
5. Copia esa contraseña y pégala en `SMTP_PASSWORD`
6. Usa `SMTP_HOST=smtp-mail.outlook.com`

### Opción B — Cuenta corporativa Microsoft 365 (@empresa.com)

1. El administrador IT debe habilitar "SMTP AUTH" para tu cuenta en el Centro de administración de Microsoft 365:
   - Ve a https://admin.microsoft.com
   - Usuarios → Tu usuario → Correo → Configuración de correo electrónico
   - Activa "SMTP autenticado"
2. Usa tu contraseña corporativa habitual en `SMTP_PASSWORD`
3. Usa `SMTP_HOST=smtp.office365.com`

### Verificar que el correo funciona

Después de arrancar la app, envía una idea de prueba y comprueba que llega al buzón configurado en `EMAIL_DESTINO`.

Si el email no llega:
- Revisa la carpeta de spam
- Verifica que `SMTP_USER` y `SMTP_PASSWORD` son correctos
- Consulta los logs del terminal donde corre la app

---

## 5. Ejecutar en local

### Modo desarrollo (con recarga automática)
```bash
npm run dev
```
La app estará disponible en: **http://localhost:3000**

### Modo producción (para servidor)
```bash
npm run build
npm start
```

---

## 6. Acceder al panel de administración

1. Ve a: http://localhost:3000/admin
2. Introduce la contraseña que pusiste en `ADMIN_PASSWORD`
3. Verás todas las ideas recibidas con filtros y la opción de exportar a Excel

**Funciones del panel:**
- Buscar ideas por texto
- Filtrar por categoría y nivel de madurez
- Ver el detalle completo de cada idea
- Exportar todas las ideas a un archivo Excel

---

## 7. Dónde se guarda el Excel

Por defecto, el archivo se guarda en:
```
sym-lab/
└── data/
    └── ideas.xlsx   ← aquí
```

### Cambiar la ubicación del Excel

En `.env.local`, modifica `EXCEL_PATH`:

```env
# Ejemplo Windows — ruta absoluta:
EXCEL_PATH=C:\Documentos\SYM-LAB\ideas.xlsx

# Ejemplo Mac/Linux:
EXCEL_PATH=/home/usuario/sym-lab/datos/ideas.xlsx
```

La carpeta se creará automáticamente si no existe.

### Leer el Excel manualmente

Abre el archivo `data/ideas.xlsx` con Microsoft Excel, LibreOffice Calc o cualquier programa compatible. Tiene una hoja llamada "Ideas" con todas las propuestas recibidas, ordenadas cronológicamente, con cabeceras y formato profesional.

### Exportar desde el panel

En el panel de administración (/admin), haz clic en **"Exportar Excel"** para descargar una copia con la fecha actual en el nombre del archivo.

---

## 8. Instalar como app en móvil y escritorio (PWA)

SYM LAB es una **Progressive Web App (PWA)**, lo que significa que puede instalarse directamente desde el navegador sin pasar por ninguna tienda de apps.

### En Android (Chrome)
1. Abre la app en Chrome
2. Pulsa el menú (⋮) → "Añadir a pantalla de inicio"
3. Confirma → la app aparecerá como icono en tu escritorio

### En iPhone/iPad (Safari)
1. Abre la app en Safari
2. Pulsa el botón de compartir (📤) → "Añadir a pantalla de inicio"
3. Confirma → la app aparecerá en tu pantalla de inicio

### En PC/Mac (Chrome o Edge)
1. Abre la app en Chrome o Edge
2. Haz clic en el icono de instalación (📥) en la barra de direcciones
3. O ve a Menú → "Instalar SYM LAB"

Una vez instalada, la app se abre como una ventana independiente sin barra del navegador.

---

## 9. Empaquetar como app de escritorio con Electron / Tauri

Para distribuir SYM LAB como un ejecutable `.exe` (Windows), `.dmg` (Mac) o `.AppImage` (Linux):

### Opción A — Electron (más sencillo)

```bash
npm install --save-dev electron electron-builder

# Añadir al package.json → scripts:
"electron:dev":   "electron .",
"electron:build": "next build && electron-builder"
```

Crea el archivo `electron.js` en la raíz:
```js
const { app, BrowserWindow } = require('electron')
const { createServer } = require('http')
const next = require('next')

const nextApp = next({ dev: false, dir: __dirname })
const handle  = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))
  server.listen(3000, () => {
    const win = new BrowserWindow({ width: 1280, height: 800 })
    win.loadURL('http://localhost:3000')
  })
})
```

### Opción B — Tauri (más ligero, recomendado a largo plazo)

Tauri genera ejecutables mucho más pequeños que Electron.
Ver documentación: https://tauri.app/v1/guides/getting-started/setup/next-js

---

## 10. Añadir imágenes de marca

Las imágenes de la app se guardan en `public/images/`.

Para añadir imágenes propias:
1. Copia tus archivos `.jpg`, `.png` o `.webp` a `public/images/`
2. En cualquier componente, referencialas como:
   ```tsx
   <img src="/images/tu-imagen.jpg" alt="Descripción" />
   ```

### Iconos de la app (para PWA e instalación)
Los iconos están en `public/icons/`. Necesitas:
- `icon-192.png` — 192×192 píxeles (obligatorio para Android)
- `icon-512.png` — 512×512 píxeles (obligatorio para iOS y pantallas de carga)

Actualmente hay un SVG de placeholder. Reemplázalos con tu logo real en formato PNG.

### Imagen OG (redes sociales)
Coloca una imagen `public/images/og-image.jpg` (1200×630px) y añade en `layout.tsx`:
```tsx
openGraph: {
  images: [{ url: '/images/og-image.jpg' }],
}
```

---

## 11. Despliegue en producción

### Opción A — Servidor VPS propio (recomendado)

```bash
# En el servidor:
git clone <tu-repositorio>
cd sym-lab
npm install
npm run build

# Con PM2 para que no se detenga:
npm install -g pm2
pm2 start "npm start" --name sym-lab
pm2 save
pm2 startup
```

Asegúrate de que las carpetas `data/` y `uploads/` tienen permisos de escritura.

### Opción B — Railway / Render (hosting gratuito)

Estos servicios permiten desplegar Next.js con pocas clicks. Importante:
- Configura las variables de entorno en el panel del servicio
- Ten en cuenta que el sistema de archivos de algunos servicios es **efímero** (los archivos se borran al reiniciar). En ese caso, necesitarás usar una ruta de almacenamiento persistente o migrar el Excel a una base de datos.

---

## 12. Seguridad y RGPD

### Medidas implementadas
- **Cabeceras de seguridad** HTTP (X-Frame-Options, X-Content-Type-Options, CSP)
- **Cookie httpOnly** para la sesión del administrador
- **Validación de formulario** en cliente y servidor
- **Nombres de archivo saneados** para evitar path traversal
- **Variables de entorno** para todas las credenciales (nunca en código)

### Recomendaciones adicionales
- Cambia `ADMIN_PASSWORD` regularmente
- Usa HTTPS en producción (Nginx o Caddy como proxy inverso)
- Haz copias de seguridad del `data/ideas.xlsx` regularmente
- Si manejas datos de empleados internos, aplica una política de retención de datos

### Cumplimiento RGPD
- El formulario incluye el checkbox de consentimiento obligatorio
- Los datos solo se utilizan para la gestión interna de propuestas
- No se comparten con servicios de terceros externos
- Documenta el tratamiento de datos en tu Registro de Actividades de Tratamiento (RAT)
- Considera añadir un enlace a tu política de privacidad completa en el footer

---

## 13. Alternativa profesional: Microsoft Graph API

Para entornos corporativos que requieran autenticación moderna (OAuth2) sin contraseñas de aplicación:

1. **Registra una aplicación en Azure Active Directory:**
   - Ve a https://portal.azure.com → Azure Active Directory → Registros de aplicaciones
   - Nueva aplicación → Nombre: "SYM LAB"
   - Permisos: `Mail.Send` (tipo Application)
   - El administrador debe conceder el consentimiento

2. **Instala el SDK:**
   ```bash
   npm install @microsoft/microsoft-graph-client @azure/identity
   ```

3. **Reemplaza `src/lib/email.ts`** con la implementación Graph:
   ```typescript
   import { ClientSecretCredential } from '@azure/identity'
   import { Client }                  from '@microsoft/microsoft-graph-client'

   function crearClienteGraph() {
     const credential = new ClientSecretCredential(
       process.env.AZURE_TENANT_ID!,
       process.env.AZURE_CLIENT_ID!,
       process.env.AZURE_CLIENT_SECRET!,
     )
     // ...
   }
   ```

---

## 14. Próximos pasos y evolución

La arquitectura está preparada para crecer. Posibles mejoras futuras:

| Mejora | Complejidad | Descripción |
|--------|------------|-------------|
| Login con roles | Media | NextAuth.js para gestores e innovadores |
| Base de datos | Media | PostgreSQL o SQLite con Prisma ORM |
| Notificaciones | Baja | Email automático al remitente al enviar |
| Panel avanzado | Media | Gráficas con estadísticas por categoría |
| Flujo de evaluación | Alta | Estados: recibida → en revisión → aprobada → rechazada |
| API pública | Alta | Endpoint para integrar con otros sistemas |
| App Electron/Tauri | Media | Ejecutable instalable de escritorio |

---

## Estructura del proyecto

```
sym-lab/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz con metadatos PWA
│   │   ├── page.tsx                # Página de inicio
│   │   ├── globals.css             # Estilos globales + Tailwind
│   │   ├── ideas/nueva/page.tsx    # Página del formulario
│   │   ├── gracias/page.tsx        # Confirmación tras envío
│   │   ├── admin/
│   │   │   ├── page.tsx            # Panel admin (protegido)
│   │   │   └── login/page.tsx      # Login del administrador
│   │   └── api/
│   │       ├── ideas/route.ts      # POST: guardar idea
│   │       ├── ideas-list/route.ts # GET: listar ideas (admin)
│   │       ├── export/route.ts     # GET: descargar Excel
│   │       └── admin/auth/route.ts # POST/DELETE: sesión admin
│   ├── components/
│   │   ├── Header.tsx              # Barra de navegación
│   │   ├── Footer.tsx              # Pie de página
│   │   ├── IdeaForm.tsx            # Formulario completo con validación
│   │   └── AdminPanel.tsx          # Panel con tabla, filtros y stats
│   └── lib/
│       ├── types.ts                # Tipos TypeScript compartidos
│       ├── excel.ts                # Lectura y escritura del .xlsx
│       └── email.ts                # Plantilla y envío de correo
├── public/
│   ├── manifest.json               # Configuración PWA
│   ├── icons/                      # Iconos de la app (reemplazar con los tuyos)
│   └── images/                     # Imágenes (añadir aquí las de la empresa)
├── data/                           # Excel con las ideas (autogenerado)
├── uploads/                        # Archivos adjuntos por idea (autogenerado)
├── .env.local                      # Variables de entorno (¡no subir a git!)
├── .env.local.example              # Plantilla de configuración
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

*SYM LAB — Donde las ideas se convierten en innovación.*
