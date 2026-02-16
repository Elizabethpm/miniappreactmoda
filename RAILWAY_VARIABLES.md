# ⚙️ Variables para Railway - COPIAR Y PEGAR

## 📌 Instrucciones Rápidas

1. Ve a Railway.app → Tu Proyecto MiniAppReactModa
2. Haz clic en el servicio backend
3. Ve a la pestaña **"Variables"**
4. Agrega cada variable exactamente como aparece abajo

---

## 🔐 Variables de Entorno

Copia y pega EXACTAMENTE estas líneas en Railway:

### Variable 1: MongoDB URI
**Nombre**: `MONGODB_URI`
**Valor**:
```
mongodb+srv://elizabethmendezp18:icZ9DRWUTMRLqzcx@miniappmoda.lxhi0eq.mongodb.net/?appName=MiniAppModa
```

### Variable 2: JWT Secret
**Nombre**: `JWT_SECRET`
**Valor**:
```
ElizabethModa2024SecureKey!@#$%^&*()_+-=[]{}|;:'",.<>?/
```

### Variable 3: Node Environment
**Nombre**: `NODE_ENV`
**Valor**:
```
production
```

### Variable 4: Port
**Nombre**: `PORT`
**Valor**:
```
4000
```

### Variable 5: CORS Origin
**Nombre**: `CORS_ORIGIN`
**Valor**:
```
https://elizabethpm-modamedidas.vercel.app
```

---

## ✅ Pasos Visuales en Railway

1. **Abrir Variables**
   - Proyecto → Servicio backend → Variables

2. **Crear Variable**
   - Botón "+ New Variable"
   - Poner nombre exacto (ejemplo: MONGODB_URI)
   - Poner valor exacto
   - Hacer clic en "Add"

3. **Repetir 5 veces** (una para cada variable)

4. **Guardar**
   - Las variables se guardan automáticamente

---

## 🚀 Después de Agregar Variables

1. Railway debería reiniciar automáticamente
2. Esperar 2-3 minutos a que despliegue
3. Ir a "Logs" para ver si compila correctamente
4. Debería ver: "✅ MongoDB conectado"

---

## ⚠️ Importante

- **NO compartir contraseñas** en documentos publicos
- **NO usar estas credenciales** en GitHub
- Railroad las almacena de forma segura
- Solo el backend puede ver estas variables

---

## 📞 Si hay Errores

Mira los Log en Railway:
- Proyecto → Deployment → View Logs
- Busca mensajes rojo o "Error"
- Común: "Cannot connect to MongoDB"
  - Verificar MONGODB_URI esté correcto
  - Verificar MongoDB Atlas permita IP 0.0.0.0/0

