import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moda_medidas'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ MongoDB conectado:', mongoose.connection.host)
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message)
    process.exit(1)
  }

  mongoose.connection.on('error',        (err) => console.error('MongoDB error:', err))
  mongoose.connection.on('disconnected', ()    => console.warn('MongoDB desconectado'))
  mongoose.connection.on('reconnected',  ()    => console.log('MongoDB reconectado'))

  // Cierre limpio
  process.on('SIGINT', async () => {
    await mongoose.connection.close()
    console.log('MongoDB cerrado por SIGINT')
    process.exit(0)
  })
}
