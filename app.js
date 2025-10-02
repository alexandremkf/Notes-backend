// app.js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const notesRouter = require('./controllers/notes')

const app = express()

// conectar ao MongoDB
mongoose.set('strictQuery', false)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch(error => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

// middlewares
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

// rotas
app.use('/api/notes', notesRouter)

// middlewares finais
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
