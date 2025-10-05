const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body

    if (!password || password.length < 3) {
      return res.status(400).json({ error: 'password must be at least 3 characters long' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, name, passwordHash })
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ error: 'expected `username` to be unique' })
    }
    next(error)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('notes', { content: 1, important: 1 })

  response.json(users)
})

module.exports = usersRouter