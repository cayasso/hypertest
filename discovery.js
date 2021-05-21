const hyperswarm = require('hyperswarm')
const swarm = hyperswarm()

const topic = Buffer.from('a49766a23610999dc5dfe05bc37cd98a9911d4b46bd25fc2cd037b9669a1e214', 'hex')

swarm.join(topic, {
  lookup: true, // find and connect to peers
  announce: true, // announce as connection target
})

swarm.on('connection', (socket, details) => {
  //   console.log('found peer', details)

  //   socket.write('Hoooola mundo')

  socket.on('data', (msg) => {
    console.log('GETTING ', msg.toString())
  })

  process.stdin.pipe(socket).pipe(process.stdout)
})
