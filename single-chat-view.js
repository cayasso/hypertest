const hyperswarm = require('hyperswarm')
const hypercore = require('hypercore')
const pump = require('pump')

const pubKey = 'a95532734fdb79128da7ac1b6b937f983e486c118a80f9f11279896aca04f328'
const feed = hypercore('./single-chat-feed-clone', pubKey, { valueEncoding: 'json' })

feed.createReadStream({ live: true }).on('data', (data) => {
  console.log(data)
})

const swarm = hyperswarm()

feed.ready(() => {
  console.log('public key:', feed.key.toString('hex')) // share and encrypt with trusted
  console.log('discovery key:', feed.discoveryKey.toString('hex')) // hash of public key, share with non trusted

  swarm.join(feed.discoveryKey, { lookup: true, announce: true })
  swarm.on('connection', (socket, details) => {
    console.log('New peer connected')

    pump(socket, feed.replicate(details.client, { live: true }), socket)
  })
})
