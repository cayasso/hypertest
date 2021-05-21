const hyperswarm = require('hyperswarm')
const multifeed = require('multifeed')
const crypto = require('crypto')
const pump = require('pump')

if (process.argv.length !== 3) {
  console.log('USAGE: "node multifeed.js 1" or "node multifeed.js 2"')
  process.exit(1)
  return
}

const num = process.argv[2]

const multi = multifeed('./multichat-' + num, {
  valueEncoding: 'json',
})

const topic = crypto.createHash('sha256').update('mychat').digest()

multi.writer('local', (error, feed) => {
  startSwarm(topic)
  printChat()

  process.stdin.on('data', function (data) {
    feed.append({
      type: 'chat-message',
      nickname: 'cat-lover',
      text: data.toString().trim(),
      timestamp: new Date().toISOString(),
    })
  })

  feed.createReadStream({ live: true }).on('data', (data) => {
    console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
  })
})

const startSwarm = (topic) => {
  const swarm = hyperswarm()

  swarm.join(topic, { lookup: true, announce: true })

  swarm.on('connection', (socket, info) => {
    console.log('New peer connected!')
    pump(socket, multi.replicate(info.client, { live: true }), socket)
  })
}

const printChat = () => {
  multi.ready(function () {
    const feeds = multi.feeds()
    feeds.forEach(logFeed)
    multi.on('feed', logFeed)
  })
}

const logFeed = (feed) => {
  console.log('watching', feed.key.toString('hex'), feed.length)

  feed.createReadStream({ live: true }).on('data', (data) => {
    console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`)
  })
}
