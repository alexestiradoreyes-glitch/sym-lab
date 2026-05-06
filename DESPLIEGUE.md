# Despliegue de SYM LAB

## Variables de entorno requeridas

Crea un archivo `.env.local` con estas variables antes de desplegar:

```env
# Email de notificación (opcional — usa Resend)
RESEND_API_KEY=tu_api_key_de_resend
EMAIL_DESTINO=admin@tuempresa.com
```

> Si no configuras email, la app funciona igual pero no enviará notificaciones.

---

## Opción A — Vercel (recomendado)

### Despliegue automático desde GitHub

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuusuario/sym-lab.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **Add New Project** → importa tu repositorio

3. En **Environment Variables**, añade las variables del `.env.local`

4. Haz clic en **Deploy** → Vercel genera una URL pública en ~2 minutos

### Despliegue sin GitHub (drag & drop)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Vercel detecta Next.js automáticamente. Cuando pregunte por el directorio, escribe `.`

---

## Opción B — Netlify

### Desde la interfaz web

1. Ve a [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
2. Genera el build local:
   ```bash
   npm run build
   ```
3. Arrastra la carpeta `.next` al área de drop de Netlify
4. Netlify genera una URL del tipo `https://nombre-aleatorio.netlify.app`

### Desde la CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=.next
```

> **Nota:** Netlify requiere el plugin `@netlify/plugin-nextjs` (ya incluido en `netlify.toml`).
> Instálalo si pide: `npm install --save-dev @netlify/plugin-nextjs`

---

## Datos persistentes en producción

La app guarda datos en archivos locales (`data/ideas.xlsx`, `data/comments.json`, `data/enlaces.json`). **Estos archivos se resetean en cada redeploy** en Vercel/Netlify.

Para persistencia real en producción, tienes dos opciones:

### Opción 1 — Base de datos externa (recomendada)
- **PlanetScale** (MySQL gratuito) o **Supabase** (PostgreSQL gratuito)
- Sustituye `src/lib/excel.ts` y `src/lib/storage.ts` por llamadas a la BD

### Opción 2 — Almacenamiento de objetos
- **Vercel Blob** o **Cloudflare R2** para guardar los JSON/Excel en la nube
- Las funciones API siguen igual pero leen/escriben en el bucket en vez de disco

---

## Instalar como app en móvil

Una vez desplegada con URL pública:

### Android (Chrome)
1. Abre la URL en Chrome
2. Pulsa los tres puntos `⋮` → **"Añadir a pantalla de inicio"**
3. La app se instala como aplicación nativa

### iPhone (Safari)
1. Abre la URL en Safari
2. Pulsa el botón de compartir `⎙` → **"Añadir a pantalla de inicio"**
3. Confirma con **"Añadir"**

> La app funciona offline gracias al service worker incluido.

---

## Desarrollo local

```bash
cd sym-lab
npm install
npm run dev
# → http://localhost:3000
```
