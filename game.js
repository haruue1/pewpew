import {
    Player,
    Ghost,
    Projectile,
} from "./src/Classes.js"

const canvas = document.querySelector("#game-layer")
const deadboi = document.querySelector(".boi-is-dead")

/** @type {CanvasRenderingContext2D} */
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight
const GameState = {
    Playing: "Playing",
    GameOver: "GameOver",
}
let currentGameState = GameState.Playing
let projectiles = []
let ghosts = []
let mouse = {x: 0, y: 0}
let score = 0

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    p: false, // p for pog
}


function fireProjectile() {
    let newProjectile = new Projectile(c, {x: player.position.x, y: player.position.y}, {x: mouse.x, y: mouse.y}, 5, "#ff0000")
    newProjectile.fire()
    projectiles.push(newProjectile)
}

function checkCollision(entity1, entity2) {
    if (entity2.position.x > entity1.position.x - (75/2) && entity2.position.x < entity1.position.x + (75/2) &&
        entity2.position.y > entity1.position.y - (75/2) && entity2.position.y < entity1.position.y + (75/2)) {
            return true
        }
    return false
}

const player = new Player(
    c,
    {x: canvas.width/2, y: canvas.height/2},
    {x: 0, y: 0},
    10,
    "#88c0d0",
)

function spawnGhost() {
    let x = Math.random() * canvas.width
    let y = 100
    const normal_ghost = "../assets/ghost.png"
    const red_ghost = "../assets/ghost_red.png"

    let red_chance = Math.random() * 100

    if (red_chance > 90) {
        ghosts.push(new Ghost(c, {x: x, y: y}, player.position, 200, 600, red_ghost))
    } else {
        ghosts.push(new Ghost(c, {x: x, y: y}, player.position, 50, 100, normal_ghost))
    }
}


addEventListener("keydown", e => {
    keys[e.key] = true
})

addEventListener("keyup", e => {
    keys[e.key] = false 
})

addEventListener("mousedown", e => {
    player.isShooting = true
})

addEventListener("mouseup", e => {
    player.isShooting = false
})

addEventListener("mousemove", e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})

let last_timestamp = 0
let last_fire = 0
let fps = 0

function draw_fps(value) {
    c.font = "10px Arial"
    c.fillStyle = "#a3be8c"
    c.fillText(value, 10, 20)
}

function draw_score() {
    const size = 50
    c.font = `${size}px Arial`
    c.fillStyle = "#a3be8c"
    c.fillText("Score: " + score, 10, size + 20)
}

function update_score(value) {
    score += value
}

function clear_screen() {
    c.clearRect(0, 0, canvas.width, canvas.height)
}

function show_easter_egg() {
    alert("YOU FOUND THE EGGS")
    keys.p = false
}

function handleKeyboardInput() {
    player.direction.x = keys.a ? -1 : keys.d ? 1 : 0
    player.direction.y = keys.w ? -1 : keys.s ? 1 : 0
    if (keys.p) show_easter_egg()
}

function updateGameObjects(delta) {
    player.update(delta)
    player.draw()
    
    ghosts.forEach(ghost => {
        ghost.update()
        ghost.draw()
        if (checkCollision(ghost, player)) {
            player.dead = true
        }
    })

    projectiles.forEach((projectile, index) => {
        if (projectile.position.x > 0 && projectile.position.x < canvas.width && 
            projectile.position.y > 0 && projectile.position.y < canvas.height) {
            projectile.update(delta)
            projectile.draw()
            ghosts.forEach((ghost, ghostIndex) => {

                if (checkCollision(ghost, projectile)) {
                    projectiles.splice(index, 1)
                    ghost.health -= projectile.projectileDamage
                }
                
                if (ghost.health <= 0) {
                    update_score(ghost.reward)
                    ghosts.splice(ghostIndex, 1)
                }
            })
        } else {
            projectiles.splice(index, 1)
        }
    })
}

function game_loop(timestamp) {
    clear_screen()
    let delta = timestamp - last_timestamp

    switch (currentGameState) {
        case GameState.Playing:
                handleKeyboardInput()

                if (player.isShooting) {
                    if (timestamp > last_fire) {
                        fireProjectile()
                        last_fire = timestamp + Projectile.fireRate
                    }
                }
                
                updateGameObjects(delta)
                
                fps = 1000 / delta
                draw_fps("FPS: " + Math.round(fps))
                draw_score()
                if (player.dead) {
                    currentGameState = GameState.GameOver
                }
                requestAnimationFrame(game_loop)
            break
        case GameState.GameOver:
                clearInterval(ghostSpawner)
                clear_screen()
                canvas.style.display = "none"
                deadboi.style.display = "block"
            break
    }

    last_timestamp = timestamp
}
requestAnimationFrame(game_loop)
const ghostSpawner = setInterval(spawnGhost, 1000)


