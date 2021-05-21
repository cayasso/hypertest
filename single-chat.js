const hyperswarm = require('hyperswarm')
const hypercore = require('hypercore')
const pump = require('pump')

const feed = hypercore('./single-chat-feed', {
  valueEncoding: 'json',
})

feed.append(
  {
    type: 'chat-message',
    nickname: 'cat-lover',
    text: 'Hello world',
    timestamp: new Date().toISOString(),
  },
  (error, seq) => {
    if (error) throw error
    console.log('Data was appended as entry #' + seq)
  }
)

// feed.get(0, (err, msg) => {
//   console.log('msg', msg)
// })

process.stdin.on('data', function (data) {
  feed.append({
    type: 'chat-message',
    nickname: 'cat-lover',
    text: 'HOOOOLA ' + data.toString().trim(),
    timestamp: new Date().toISOString(),
  })
})

feed.createReadStream({ live: true }).on('data', function (data) {
  console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
})

const swarm = hyperswarm()

feed.ready(() => {
  console.log('public key:', feed.key.toString('hex')) // share and encrypt with trusted
  console.log('discovery key:', feed.discoveryKey.toString('hex')) // hash of public key, share with non trusted
  console.log('secret key:', feed.secretKey.toString('hex')) // keep it on local device

  swarm.join(feed.discoveryKey, { lookup: true, announce: true })

  swarm.on('connection', (socket, details) => {
    console.log('New peer connected')

    pump(socket, feed.replicate(details.client, { live: true }), socket)
  })
})
