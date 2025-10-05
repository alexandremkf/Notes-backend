const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const assert = require('assert')
const test = require('node:test')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

test('user creation tests', async (t) => {
  // Limpa o banco e cria um usuário inicial antes de cada bloco
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const rootUser = new User({ username: 'root', passwordHash })
  await rootUser.save()

  // Teste: criação com username novo
  await t.test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  // Teste: username já existente
  await t.test('creation fails if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  // Teste: username muito curto
  await t.test('creation fails if username is too short', async () => {
    const newUser = {
      username: 'ro', // menos de 3 caracteres
      name: 'Short User',
      password: 'validpassword',
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert(result.body.error.includes('is shorter than the minimum allowed length'))
  })

  // Teste: password muito curto
  await t.test('creation fails if password is too short', async () => {
    const newUser = {
      username: 'validuser',
      name: 'Short Password',
      password: 'pw', // menos de 3 caracteres
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    assert(result.body.error.includes('password must be at least 3 characters long'))
  })
})

// afterAll: fecha conexão com o Mongo
test('close mongoose connection', async () => {
  await mongoose.connection.close()
})
