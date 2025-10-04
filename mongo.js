const mongoose = require('mongoose')
const Note = require('./models/note')
const config = require('./utils/config')

mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    console.log('Connected to test MongoDB')

    await Note.deleteMany({}) // limpa coleção antes

    const note1 = new Note({ content: 'HTML is easy', important: true })
    const note2 = new Note({ content: 'Browser can execute only JavaScript', important: false })

    await note1.save()
    await note2.save()

    console.log('Test notes added')
    mongoose.connection.close()
  })
  .catch(err => console.error(err))