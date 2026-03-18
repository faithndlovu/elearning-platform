const express = require('express')
const cors    = require('cors')
const app     = express()

// Allow requests from the React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'E-Learning API is running' })
})

app.use('/auth',     require('./modules/auth/auth.routes'))
app.use('/courses',  require('./modules/courses/courses.routes'))
app.use('/sessions', require('./modules/sessions/sessions.routes'))
app.use('/me',       require('./modules/enrollments/enrollments.routes'))
app.use('/payouts',  require('./modules/payouts/payouts.routes'))

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

module.exports = app