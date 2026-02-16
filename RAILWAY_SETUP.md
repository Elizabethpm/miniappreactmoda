# 🚀 Guía de Deployment en Railway

## Paso 1: Crear Proyecto en Railway

1. Ir a https://railway.app
2. Hacer login con GitHub (usar usuario de Elizabeth)
3. Hacer clic en **"Create New Project"**
4. Seleccionar **"Deploy from GitHub repo"**
5. Seleccionar el repositorio: **Elizabethpm/MiniAppReactModa**
6. Hacer clic en **"Create Project"**

## Paso 2: Agregar MongoDB Atlas

Railway no tiene MongoDB incluido. Usaremos MongoDB Atlas (cloud):

### En MongoDB Atlas:
1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita con email Elizabeth
3. Crear un proyecto: "MiniAppModa"
4. Crear un cluster: "MiniAppCluster" (usar free tier)
5. En "Network Access" → permitir IP: 0.0.0.0/0 (permiso total)
6. En "Database Access" → crear usuario:
   - Username: `elizabeth`
   - Password: (generar contraseña segura)
   - Guardar esta contraseña
7. Ir a "Connect" → "Drivers" → copiar connection string:
   ```
   mongodb+srv://elizabeth:<password>@miniappcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Paso 3: Configurar Variables en Railway

En Railway dashboard → tu proyecto → Variables:

Agregar estas variables (copiar y pegar exactamente):

```
MONGODB_URI=mongodb+srv://elizabeth:PASSWORD@miniappcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_esto
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://elizabethpm-modamedidas.vercel.app
```

⚠️ **IMPORTANTE**: 
- Cambiar `PASSWORD` por la contraseña de MongoDB Atlas
- Cambiar `miniappcluster.xxxxx` por tu cluster ID real
- Cambiar `JWT_SECRET` por algo seguro

## Paso 4: Configurar el Servicio Backend

En Railway:

1. Ir a **"Services"** → **"+ New Service"**
2. Seleccionar **"GitHub Repo"**
3. Conectar el repositorio si no está
4. El servicio debería detectar automáticamente los archivos en `server/`

Si no lo detecta:
1. Hacer clic en **"Settings"** del servicio
2. En **"Root Directory"** poner: `server`
3. En **"Build Command"**: `npm install`
4. En **"Start Command"**: `npm start`

## Paso 5: Variables de Entorno del Backend

En Railway → tu servicio backend → **Variables**:

Agregar las mismas variables (MONGODB_URI, JWT_SECRET, etc.)

## Paso 6: Deploy

Railway debería hacer deploy automáticamente cuando:
1. Empujes código a GitHub
2. O hagas clic en **"Deploy"** manualmente

**Esperar 2-5 minutos** para que compile y despliegue.

## Verificar que funciona

1. En Railway → tu proyecto → ver URL del backend
2. Ir a: `https://tu-url-railway.railway.app/health`
3. Debería devolver: `{"status":"ok","timestamp":"..."}`

Si ves error → ir a **"View Logs"** para ver qué falla

## Errores Comunes

### Error: "Error creating build plan with Railpack"
✅ Ya lo arreglamos usando Dockerfile

### Error: "Cannot connect to MongoDB"
- Verificar que MONGODB_URI esté correcto
- Verificar que MongoDB Atlas permitió IP 0.0.0.0/0
- Verificar usuario y contraseña

### Error: "Cannot find module"
- Asegurar que el Root Directory es `server`
- Ejecutar: `cd server && npm install` localmente para verificar

### Puerto 5000/3000 no funciona
- Railway asigna puerto dinámico en `process.env.PORT`
- Nuestro código ya lo usa: `PORT = process.env.PORT || 4000`
- No especificar puerto manualmente

## URLs Después del Deploy

- **Backend API**: `https://tu-url-railway.railway.app` (Railway asigna automáticamente)
- **Frontend**: `https://elizabethpm-modamedidas.vercel.app` (Vercel)

## Siguiente: Connecting Frontend con Backend

En Vercel (frontend), agregar variable de entorno:

```
VITE_API_URL=https://tu-url-railway.railway.app
```

Esto hace que el frontend sepa dónde está el backend.

---

¿Necesitas ayuda en algún paso específico? 🚀
