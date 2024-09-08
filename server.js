const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err))

// Routes
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const googleAuthRoutes = require('./routes/googleAuth')

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/auth', googleAuthRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))