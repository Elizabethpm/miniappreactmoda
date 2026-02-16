# ✅ Checklist de Deployment - ModaMedidas

## 📋 Antes de empezar
- [ ] Código committed y pusheado a GitHub
- [ ] Repository público o acceso dado a Railway/Vercel
- [ ] Credenciales de MongoDB Atlas listas

---

## 🏗️ Pasos de Deployment

### 1. MongoDB Atlas
- [ ] Cuenta creada en [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] Cluster M0 (gratuito) configurado
- [ ] Usuario/contraseña configurados
- [ ] IP `0.0.0.0/0` (allow all) agregada
- [ ] Connection string copiado
- [ ] Base de datos `modamedidas` creada

### 2. Railway (Backend)
- [ ] Cuenta creada en [railway.app](https://railway.app)
- [ ] Proyecto desde GitHub repo
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `JWT_SECRET=tu_secreto_aquí`
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `MONGODB_URI=mongodb+srv://...`
  - [ ] `FRONTEND_URL=https://tu-app.vercel.app`
- [ ] Deploy exitoso
- [ ] URL del backend copiada
- [ ] Health check funcionando: `/health`

### 3. Vercel (Frontend)
- [ ] Cuenta creada en [vercel.com](https://vercel.com)
- [ ] Proyecto desde GitHub repo (carpeta `client`)
- [ ] Variables de entorno configuradas:
  - [ ] `VITE_API_URL=https://tu-backend-railway.up.railway.app`
  - [ ] `VITE_APP_NAME=ModaMedidas`
  - [ ] `VITE_APP_VERSION=1.0.0`
- [ ] Deploy exitoso
- [ ] Ruta principal funcionando
- [ ] API conectando correctamente

### 4. Datos Iniciales
- [ ] Usuario admin creado (usar Railway terminal o local):
  ```bash
  npm run seed:admin
  ```
- [ ] Servicios de Elizabeth cargados:
  ```bash
  npm run seed:services
  ```

### 5. Testing Final
- [ ] Login con credenciales de prueba funciona
- [ ] Crear nuevo cliente
- [ ] Tomar medidas
- [ ] Generar PDF
- [ ] Navegación entre todas las páginas
- [ ] Responsive design (móvil/tablet)

---

## 🔑 URLs y Credenciales Final

### URLs
- **Frontend**: https://_____.vercel.app
- **Backend**: https://_____.up.railway.app
- **Health Check**: https://_____.up.railway.app/health

### Credenciales de Prueba
- **Email**: admin@modamedidas.com
- **Password**: Admin1234!

---

## 🐛 Troubleshooting

### ERROR: CORS
- Verificar `FRONTEND_URL` en Railway matches Vercel URL exacta

### ERROR: 404 API
- Verificar `VITE_API_URL` en Vercel incluye `/api` o no según configuración

### ERROR: Base de datos
- Verificar `MONGODB_URI` correcta
- IP whitelist incluye `0.0.0.0/0`

### ERROR: Build
- Verificar todas las dependencias en `package.json`
- Verificar variables de entorno requeridas

---

## 🎉 ¡Deployment Completado!

✅ ModaMedidas está vivo en producción
✅ Elizabeth puede usar su app desde cualquier lugar
✅ Datos respaldados en MongoDB Atlas
✅ SSL automático y CDN global