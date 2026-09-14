// Load env vars FIRST — before any other imports read process.env
import 'dotenv/config'
import 'reflect-metadata'

import app from './app'

const PORT = process.env.PORT ?? 4000

app.listen(PORT, () => {
  console.log(`🎓 EduScheduler API running on port ${PORT}`)
})
