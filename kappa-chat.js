const memdb = require('memdb')
const kappa = require('kappa-core')
const list = require('kappa-view-list')
const kv = require('kappa-view-kv')

const kvView = kv(memdb(), (msg, next) => {
  if (!msg.value.id) return next()
  const ops = []
  const msgId = msg.key + '@' + msg.seq

  // key  : the 'key' part of the key-value store
  // id   : the identifier that the key maps to (the "FEED@SEQ" uniquely maps to this message)
  // links: a list of IDs ^ that this key replaces
  ops.push({ key: msg.value.id, id: msgId, links: msg.value.links || [] })

  next(null, ops)
})

const view = list(memdb(), (msg, next) => {
  if (msg.value.timestamp && typeof msg.value.timestamp === 'string') {
    next(null, [msg.value.timestamp])
  } else {
    next()
  }
})

const core = kappa('./multichat', { valueEncoding: 'json' })

core.use('chats', view)
core.use('kv', kvView)

core.ready(() => {
  core.api.chats.tail(10, (msgs) => {
    console.log('--------------')

    msgs.forEach(function (msg, i) {
      console.log(`${i + 1} - ${msg.value.timestamp}: ${msg.value.text}`)
    })
  })
})

process.stdin.on('data', (data) => {
  core.writer('local', (error, feed) => {
    console.log('public key:', feed.key.toString('hex')) // share and encrypt with trusted
    console.log('discovery key:', feed.discoveryKey.toString('hex')) // hash of public key, share with non trusted
    console.log('secret key:', feed.secretKey.toString('hex')) // keep it on local device

    feed.append({
      type: 'chat-message',
      nickname: 'cat-lover',
      text: data.toString().trim(),
      timestamp: new Date().toISOString(),
    })
  })
})

// core.api.chats.read().on('data', console.log)
