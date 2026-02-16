import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'

const ADMIN = {
  name:       'Admin',
  email:      'admin@modamedidas.com',
  password:   'Admin1234!',
  studioName: 'Taller ModaMedidas',
  role:       'admin',
  plan:       'enterprise',
  isActive:   true,
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moda_medidas')
  console.log('✅ MongoDB conectado')

  const existing = await User.findOne({ email: ADMIN.email })
  if (existing) {
    console.log('⚠️  El usuario admin ya existe:', existing.email)
    await mongoose.disconnect()
    return
  }

  const user = await User.create(ADMIN)
  console.log('\n🌸 Usuario admin creado exitosamente:')
  console.log('   Email:      ', user.email)
  console.log('   Contraseña: ', ADMIN.password)
  console.log('   Role:       ', user.role)
  console.log('   Plan:       ', user.plan)
  console.log('\n✅ Listo para iniciar sesión en http://localhost:3000/login\n')

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
