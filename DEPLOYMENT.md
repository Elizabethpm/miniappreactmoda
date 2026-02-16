# 📋 Guía de Deployment - ModaMedidas

## 🚀 Stack de Producción
- **Frontend**: Vercel
- **Backend**: Railway 
- **Database**: MongoDB Atlas

---

## 1️⃣ MongoDB Atlas (5 min)

1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea cuenta gratuita
3. **Create Cluster** → **M0 Sandbox** (Free)
4. **Username/Password**: Guarda credenciales
5. **IP Access**: `0.0.0.0/0` (Allow from anywhere)
6. **Connect** → **MongoDB for VSCode** → Copia connection string

---

## 2️⃣ Railway Backend (10 min)

1. Ve a [railway.app](https://railway.app) 
2. **Login with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Selecciona tu repositorio
5. **Variables de entorno**:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=tu_secreto_super_seguro_aquí_123!
   JWT_EXPIRES_IN=7d
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/modamedidas
   FRONTEND_URL=https://tu-app.vercel.app
   ```
6. **Deploy** → Copia la URL generada

---

## 3️⃣ Vercel Frontend (5 min)

1. Ve a [vercel.com](https://vercel.com)
2. **Login with GitHub**
3. **New Project** → Selecciona repo → **client** folder
4. **Variables de entorno**:
   ```
   VITE_API_URL=https://tu-backend-railway.up.railway.app
   VITE_APP_NAME=ModaMedidas
   VITE_APP_VERSION=1.0.0
   ```
5. **Deploy**

---

## 4️⃣ Configurar Usuario Admin

1. En Railway Terminal o localmente:
   ```bash
   npm run seed:admin
   npm run seed:services
   ```

---

## ✅ URLs Finales
- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-backend-railway.up.railway.app
- **API Health**: https://tu-backend-railway.up.railway.app/health

---

## 🔧 Scripts Útiles

```bash
# Backend
npm run seed:admin     # Crear usuario admin
npm run seed:services  # Cargar servicios de Elizabeth

# Frontend  
npm run build         # Build para producción
npm run preview       # Previsualizar build
```

---

## 📞 Credenciales de Prueba

- **Email**: admin@modamedidas.com
- **Password**: Admin1234!

¡Listo para producción! 🎉