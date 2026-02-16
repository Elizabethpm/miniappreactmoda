/**
 * Script para pre-poblar el catálogo de servicios
 * Basado en los servicios de Elizabeth Mendez
 * https://andyrs.github.io/proy_eli/
 * 
 * Ejecutar: node src/utils/seedServices.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import ServiceCatalog from '../models/ServiceCatalog.js'
import User from '../models/User.js'

dotenv.config()

const SERVICES = [
  {
    name: 'Vestido Princesa Rosa',
    description: 'Vestido de tul con bordados florales y cinta de satén. Tallas 5-7 años.',
    category: 'confeccion',
    basePrice: 150,
    priceUnit: 'unidad',
    estimatedDays: 14,
  },
  {
    name: 'Vestido Elegancia Blanca',
    description: 'Diseño sofisticado con encaje francés y perlas. Tallas 8-10 años.',
    category: 'confeccion',
    basePrice: 180,
    priceUnit: 'unidad',
    estimatedDays: 14,
  },
  {
    name: 'Vestido Cielo Azul',
    description: 'Perfecto para el día a día con estilo. Tallas 2-4 años.',
    category: 'confeccion',
    basePrice: 95,
    priceUnit: 'unidad',
    estimatedDays: 7,
  },
  {
    name: 'Vestido Dorado Imperial',
    description: 'Lujo y distinción para ocasiones especiales. Tallas 11-14 años.',
    category: 'confeccion',
    basePrice: 220,
    priceUnit: 'unidad',
    estimatedDays: 21,
  },
  {
    name: 'Vestido Sueño Violeta',
    description: 'Magia y encanto en cada detalle con tul y brillos. Tallas 5-7 años.',
    category: 'confeccion',
    basePrice: 165,
    priceUnit: 'unidad',
    estimatedDays: 14,
  },
  {
    name: 'Vestido Rosa Romántico',
    description: 'Delicadeza y sofisticación con encaje rosa pastel. Tallas 8-10 años.',
    category: 'confeccion',
    basePrice: 175,
    priceUnit: 'unidad',
    estimatedDays: 14,
  },
  {
    name: 'Vestido de fiesta personalizado',
    description: 'Diseños espectaculares para celebraciones especiales. Incluye diseño personalizado, telas premium y detalles únicos.',
    category: 'confeccion',
    basePrice: 200,
    priceUnit: 'unidad',
    estimatedDays: 21,
  },
  {
    name: 'Vestido para eventos especiales',
    description: 'Vestidos para bodas, comuniones y ceremonias importantes. Alta costura con bordados artesanales y acabados de lujo.',
    category: 'confeccion',
    basePrice: 250,
    priceUnit: 'unidad',
    estimatedDays: 28,
  },
  {
    name: 'Diseño personalizado completo',
    description: 'Creamos el vestido de tus sueños desde cero. Incluye consultoría de diseño, bocetos exclusivos y múltiples pruebas.',
    category: 'diseno',
    basePrice: 300,
    priceUnit: 'unidad',
    estimatedDays: 35,
  },
  {
    name: 'Cortinas a medida',
    description: 'Cortinas personalizadas que transforman espacios. Incluye medida exacta e instalación.',
    category: 'otro',
    basePrice: 80,
    priceUnit: 'metro',
    estimatedDays: 7,
  },
  {
    name: 'Cojines decorativos',
    description: 'Cojines personalizados con telas premium para decoración del hogar.',
    category: 'otro',
    basePrice: 35,
    priceUnit: 'unidad',
    estimatedDays: 3,
  },
  {
    name: 'Ajustes y modificaciones',
    description: 'Perfeccionamos vestidos existentes con ajustes profesionales. Incluye ajuste perfecto y renovación de diseños.',
    category: 'arreglos',
    basePrice: 25,
    priceUnit: 'hora',
    estimatedHours: 2,
  },
  {
    name: 'Paquete completo vestido + accesorios',
    description: 'Vestido con accesorios coordinados: zapatos, diademas, bolsos. Look completo con estilo coordinado.',
    category: 'confeccion',
    basePrice: 280,
    priceUnit: 'unidad',
    estimatedDays: 21,
  },
  {
    name: 'Consultoría de diseño',
    description: 'Sesión de asesoría para definir el diseño perfecto. Incluye bocetos preliminares.',
    category: 'consultoria',
    basePrice: 50,
    priceUnit: 'hora',
    estimatedHours: 2,
  },
  {
    name: 'Bordado personalizado',
    description: 'Bordado artesanal con diseño exclusivo.',
    category: 'arreglos',
    basePrice: 30,
    priceUnit: 'unidad',
    estimatedHours: 4,
  },
  {
    name: 'Tela premium importada',
    description: 'Upgrade a telas importadas de alta calidad.',
    category: 'otro',
    basePrice: 25,
    priceUnit: 'metro',
  },
  {
    name: 'Detalles con cristales',
    description: 'Aplicación de cristales y pedrería premium.',
    category: 'arreglos',
    basePrice: 35,
    priceUnit: 'unidad',
    estimatedHours: 3,
  },
]

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Buscar el primer usuario (admin/diseñadora)
    const user = await User.findOne().sort({ createdAt: 1 })
    if (!user) {
      console.log('❌ No hay usuarios registrados. Registra un usuario primero.')
      process.exit(1)
    }

    console.log(`👤 Usuario encontrado: ${user.name} (${user.email})`)

    // Verificar si ya hay servicios
    const existingCount = await ServiceCatalog.countDocuments({ user: user._id })
    if (existingCount > 0) {
      console.log(`⚠️ Ya existen ${existingCount} servicios. ¿Deseas eliminarlos? (Ctrl+C para cancelar)`)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await ServiceCatalog.deleteMany({ user: user._id })
      console.log('🗑️ Servicios anteriores eliminados')
    }

    // Crear servicios
    const servicesWithUser = SERVICES.map(s => ({ ...s, user: user._id }))
    await ServiceCatalog.insertMany(servicesWithUser)

    console.log(`✅ ${SERVICES.length} servicios creados exitosamente!`)
    console.log('\nServicios añadidos:')
    SERVICES.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} - $${s.basePrice} ${s.priceUnit}`)
    })

    // Actualizar datos del usuario con info de Elizabeth
    await User.findByIdAndUpdate(user._id, {
      studioName: 'Elizabeth Mendez',
      phone: '+1 849-215-1118',
      address: 'Santo Domingo, República Dominicana',
      website: 'https://andyrs.github.io/proy_eli/',
      whatsapp: '+18492151118',
    })
    console.log('\n✅ Datos del perfil actualizados')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

seedServices()
