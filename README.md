# ModaMedidas — Sistema de Medidas para Diseñadoras

> Sistema digital profesional para registrar medidas corporales de clientas, generar fichas técnicas en PDF y gestionar el historial de confección. Optimizado para tablet táctil e instalable como PWA.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Tablet)                    │
│  React 18 + Vite 5 + TailwindCSS 3 + PWA            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────┐
│                  SERVIDOR (Node.js)                   │
│  Express 4 + JWT Auth + Rate Limiting + Multer       │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                    MongoDB Atlas                       │
│  Colecciones: users · clients · measures             │
└─────────────────────────────────────────────────────┘
```

---

## Estructura de carpetas

```
Mini App React Moda/
├── client/                          # Frontend React + Vite
│   ├── public/                      # Assets estáticos, íconos PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── AppLayout.jsx    # Layout principal con sidebar
│   │   │   ├── auth/                # Componentes de autenticación
│   │   │   ├── dashboard/           # Widgets del dashboard
│   │   │   ├── clients/             # Componentes de clientas
│   │   │   ├── measures/            # Formulario de medidas
│   │   │   └── pdf/                 # Generador PDF
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Estado global de autenticación
│   │   ├── hooks/
│   │   │   └── useDebounce.js       # Hook de búsqueda optimizada
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── NewClientPage.jsx
│   │   │   ├── ClientDetailPage.jsx
│   │   │   ├── MeasuresPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Instancia Axios + interceptores
│   │   │   ├── authService.js
│   │   │   ├── clientService.js
│   │   │   └── measureService.js
│   │   └── utils/
│   │       ├── pdfGenerator.js      # Generación de ficha PDF
│   │       └── cn.js                # Utilidad de clases CSS
│   ├── vite.config.js               # Config Vite + PWA
│   ├── tailwind.config.js           # Paleta de colores y tipografía
│   └── package.json
│
├── server/                          # Backend Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexión MongoDB
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Login, Register, GetMe
│   │   │   ├── client.controller.js # CRUD clientas
│   │   │   └── measure.controller.js# CRUD medidas
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # Verificación JWT
│   │   │   ├── validate.middleware.js # Validación de inputs
│   │   │   └── errorHandler.js      # Manejo centralizado de errores
│   │   ├── models/
│   │   │   ├── User.js              # Esquema diseñadora
│   │   │   ├── Client.js            # Esquema clienta
│   │   │   └── Measure.js           # Esquema medidas con historial
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── client.routes.js
│   │   │   └── measure.routes.js
│   │   └── index.js                 # Entry point del servidor
│   ├── uploads/                     # Fotos de clientas (gitignored)
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml               # Orquestación de servicios
├── package.json                     # Scripts raíz (monorepo)
└── README.md
```

---

## Instalación y Desarrollo

### Prerrequisitos
- Node.js 20+
- MongoDB 7+ (local o Atlas)
- npm 10+

### Inicio rápido

```bash
# 1. Clonar e instalar todas las dependencias
npm run install:all

# 2. Configurar variables de entorno del servidor
cp server/.env.example server/.env
# Editar server/.env con tu configuración

# 3. Iniciar en modo desarrollo (ambos servidores en paralelo)
npm run dev
```

Esto levanta:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Con Docker (producción)

```bash
# Copiar y configurar .env
cp server/.env.example server/.env

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

Acceso: http://localhost:3000

---

## API Reference

| Método | Ruta                                    | Descripción               | Auth |
|--------|-----------------------------------------|---------------------------|------|
| POST   | `/api/auth/register`                    | Registro de diseñadora    | —    |
| POST   | `/api/auth/login`                       | Inicio de sesión          | —    |
| GET    | `/api/auth/me`                          | Perfil actual             | JWT  |
| PUT    | `/api/auth/me`                          | Actualizar perfil         | JWT  |
| GET    | `/api/clients`                          | Listar clientas           | JWT  |
| POST   | `/api/clients`                          | Crear clienta             | JWT  |
| GET    | `/api/clients/:id`                      | Detalle de clienta        | JWT  |
| PUT    | `/api/clients/:id`                      | Editar clienta            | JWT  |
| DELETE | `/api/clients/:id`                      | Archivar clienta          | JWT  |
| POST   | `/api/clients/:id/photo`                | Subir foto                | JWT  |
| GET    | `/api/clients/:id/measures`             | Historial de medidas      | JWT  |
| POST   | `/api/clients/:id/measures`             | Nueva medición            | JWT  |
| GET    | `/api/clients/:id/measures/latest`      | Última medición           | JWT  |
| PUT    | `/api/clients/:id/measures/:measId`     | Actualizar medición       | JWT  |
| DELETE | `/api/clients/:id/measures/:measId`     | Eliminar medición         | JWT  |

---

## Modelos de Base de Datos

### User (Diseñadora)
```js
{
  name, email, password (hash),
  studioName, phone, logoUrl, address,
  role: ['designer', 'admin'],
  plan: ['free', 'pro', 'enterprise'],
  planExpiresAt, stripeCustomerId
}
```

### Client (Clienta)
```js
{
  name, phone, email, birthdate, notes,
  photoUrl, isActive,
  designer: ObjectId → User
}
```

### Measure (Medición)
```js
{
  client: ObjectId → Client,
  designer: ObjectId → User,
  upper: { busto, bajoBusto, cintura, cadera, hombros,
           largoBrazo, contornoBrazo, largoTorso },
  lower: { cintura, cadera, largoFalda, largoPantalon,
           entrepierna, contornoMuslo },
  fitType: ['ceñido', 'regular', 'holgado'],
  fabricType, technicalNotes, referencePhotoUrl,
  suggestedSize,  // calculado automáticamente por busto
  label,          // nombre de la sesión
  changeLog: [{ date, field, oldValue, newValue }]
}
```

---

## Escalabilidad: Camino a SaaS

### Fase 1 — Multi-usuario (ya preparado)
- El modelo `User` ya incluye campos `plan` y `planExpiresAt`
- Cada clienta y medida está vinculada a su `designer` (aislamiento de datos)
- Rate limiting configurado para entornos de múltiples usuarios

### Fase 2 — Planes de suscripción
```
1. Agregar middleware de verificación de plan:
   - Plan 'free': máximo 10 clientas
   - Plan 'pro': clientas ilimitadas + exportación avanzada
   - Plan 'enterprise': múltiples diseñadoras + white-label

2. Integrar Stripe:
   server/src/controllers/billing.controller.js
   - POST /api/billing/create-checkout-session
   - POST /api/billing/webhook (Stripe webhook)
   - GET  /api/billing/portal

3. Variables de entorno requeridas:
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_ENTERPRISE=price_...
```

### Fase 3 — CRM completo
```
Nuevos modelos:
  Order  → Pedidos (prenda, material, precio, fecha entrega)
  Payment → Pagos (monto, método, estado)

Nuevas rutas:
  /api/clients/:id/orders
  /api/clients/:id/payments

Dashboard con:
  - Ingresos mensuales
  - Pedidos pendientes
  - Calendario de entregas
```

### Fase 4 — White-label
```
Modelo Studio (taller):
  - Nombre, logo, colores de marca
  - Dominio personalizado
  - Múltiples diseñadoras por taller

Middleware de tenant:
  - Identificar taller por subdominio o header
  - Filtrar todos los queries por studioId
```

---

## Tecnologías Clave

| Capa       | Tecnología              | Versión | Propósito                     |
|------------|-------------------------|---------|-------------------------------|
| Frontend   | React                   | 18.x    | UI declarativa                |
| Frontend   | Vite                    | 5.x     | Bundler ultra-rápido          |
| Frontend   | TailwindCSS             | 3.x     | Estilos utility-first         |
| Frontend   | React Router            | 6.x     | Enrutamiento SPA              |
| Frontend   | React Query             | 3.x     | Cache y estado del servidor   |
| Frontend   | React Hook Form + Zod   | —       | Formularios + validación      |
| Frontend   | jsPDF + autoTable       | —       | Generación de PDF             |
| Frontend   | Lucide React            | —       | Íconos SVG                    |
| Frontend   | Vite PWA Plugin         | —       | Instalable en tablet          |
| Backend    | Node.js                 | 20.x    | Runtime JavaScript            |
| Backend    | Express                 | 4.x     | Framework HTTP                |
| Backend    | Mongoose                | 8.x     | ODM para MongoDB              |
| Backend    | JWT + bcryptjs          | —       | Autenticación segura          |
| Backend    | Helmet + Rate Limit     | —       | Seguridad HTTP                |
| Base datos | MongoDB                 | 7.x     | Base de datos NoSQL           |
| DevOps     | Docker + Nginx          | —       | Contenedores + proxy reverso  |

---

*ModaMedidas v1.0 — Construido con arquitectura escalable para crecer de app personal a SaaS.*
