var neatLog = require('neat-log')
var blit = require('txt-blit')

var neat = neatLog(view, { fullscreen: true })
neat.use(mainloop)

var termWidth = process.stdout.columns
var termHeight = process.stdout.rows

function view(state) {
  var screen = []

  var x = Math.floor(termWidth / 2) + state.xOffset
  var y = Math.floor(termHeight / 2)
  blit(screen, draw(termWidth), 0, 0)
  blit(screen, draw(termWidth), 0, termHeight - 1)
  blit(screen, draw(1, termHeight), 0, 0)
  blit(screen, draw(1, termHeight), termWidth - 1, 0)
  //   blit(screen, drawFilledBox(termWidth, termHeight), 0, 0)
  //   blit(screen, drawFilledBox(termWidth, 0), 0, 0)

  return screen.join('\n')
}

function mainloop(state, bus) {
  state.xOffset = 0
  setInterval(function () {
    state.xOffset = Math.floor(Math.sin(new Date().getTime() / 500) * 20)
    bus.emit('render')
  }, 5)
}

function draw(w, h = 1) {
  var across = new Array(w).fill('#').join('')
  var down = new Array(h).fill(across)
  return down
}
