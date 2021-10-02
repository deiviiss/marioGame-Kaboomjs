//?=============================== configuración inicial
kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0, 0, 0, 1]
})

//?============== Variables de movimiento
const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const MOVE_SPEED_CHARACTERES = 30
let isJumping = true
const FALL_DEATH = 400

//?============== Imagenes de escenario
// loadRoot('https://i.imgur.com/')
loadSprite('brick', './img/1 - pogC9x5.png')
loadSprite('coin', './img/2 - wbKxhcd.png')
loadSprite('evil-shroom', './img/3 - KPO3fR9.png')
loadSprite('mario', './img/6 - Wb1qfhK.png')
loadSprite('mushroom', './img/7 - 0wMd92p.png')
loadSprite('surprise', './img/9 - gesQ1KP.png')
loadSprite('unboxed', './img/10 - bdrLpi6.png')
loadSprite('pipe-bottom-left', './img/11 - c1cYSbt.png')
loadSprite('pipe-bottom-right', './img/12 - nqQ79eI.png')
loadSprite('pipe-top-right', './img/13 - hj2GK4n.png')
loadSprite('pipe-top-left', './img/14 - ReTPiWY.png')
loadSprite('block', './img/20 - M6rwarW.png')

loadSprite('blue-block', './img/19 - fVscIbn.png')
loadSprite('blue-brick', './img/15 - 3e5YRQd.png')
loadSprite('blue-steel', './img/17 - gqVoI2b.png')
loadSprite('blue-evil-shroom', './img/16 - SvV4ueD.png')
loadSprite('blue-surprise', './img/18 - RMqCc1G.png')

//?============== Escenarios
scene("game", ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj')

  const maps = [
    [
      '                                               ',
      '                                               ',
      '                                               ',
      '                                               ',
      '                                               ',
      '     %   =*=%=                                 ',
      '                                               ',
      '                            -+                  ',
      '                 ^  ^   ^   ()                 ^',
      '==============================   ===============',
    ],
    [
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£        @@@@@@          z    x  x        £',
      '£                          x  x  x        £',
      '£                        x x  x  x  x   -+£',
      '£               z   z  x x x  x  x  x   ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    [
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£                                         £',
      '£        @@@@@@               x  x        £',
      '£                          x  x  x        £',
      '£                        x x  x  x  x   -+£',
      '£             zzz   z  x x x  x  x  x   ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ]
  ]

  //?============== Configuración levels personajes
  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],

    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],
  }

  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: (score)
    }
  ])

  add([text('level' + parseInt(level + 1)), pos(40, 6)])

  //habilidad del mushroom
  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(1)
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(2)
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
        timer = time
        isBig = true
      }
    }
  }

  const player = add([
    sprite('mario'), solid(),
    pos(30, 0),
    body(),
    big(),
    origin('bot')
  ])

  //?============== movimiento mushroom - enemigos
  action('mushroom', (m) => {
    m.move(MOVE_SPEED_CHARACTERES, 0)
  })

  action('dangerous', (d) => {
    d.move(-MOVE_SPEED_CHARACTERES, 0)
  })

  // romper bloques (coin - mushroom - evil)
  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
  })

  player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
  })

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    }
    else {
      go('lose', { score: scoreLabel.value })
    }
  })

  player.collides('coin', (c) => {
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
  })

  //next level
  player.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      })
    })
  })


  //muerte por caida
  player.action(() => {
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value })
    }
  })

  //?=============================== movimiento
  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
  })

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
    }
  })

})

scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})

start("game", { level: 0, score: 0 })