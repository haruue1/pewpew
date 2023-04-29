const canvas = document.querySelector("#game-layer")
const deadboi = document.querySelector(".boi-is-dead")

/** @type {CanvasRenderingContext2D} */
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight
let projectiles = []
let ghosts = []
let isShooting = false
let mouse = {x: 0, y: 0}
let score = 0

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    p: false, // p for pog
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

class Entity {
    constructor(position, direction, radius, color) {
        this.position = position
        this.direction = direction
        this.velocity = {x: 0, y: 0}
        this.radius = radius
        this.color = color
        this.speed = 1 
        this.dead = false
    }

    update(delta) {
        this.velocity.y = this.direction.y * delta
        this.velocity.x = this.direction.x * delta

        this.position.x += this.velocity.x / 2
        this.position.y += this.velocity.y / 2

        let min = 0 + this.radius
        let max_width = canvas.width - this.radius
        let max_height = canvas.height - this.radius

        this.position.x = clamp(this.position.x, min, max_width)
        this.position.y = clamp(this.position.y, min, max_height)
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
}

class Ghost {
    constructor(position, health = 100, reward = 100, image_source) {
        this.image = new Image()
        this.position = position
        this.velocity = {x: 0, y: 0}
        this.health = health
        this.image_source = image_source
        this.reward = reward
    }

    update(delta) {
        let dx = player.position.x - this.position.x
        let dy = player.position.y - this.position.y
        let angle = Math.atan2(dy, dx)
        this.velocity.x = Math.cos(angle)
        this.velocity.y = Math.sin(angle)

        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 
    }

    draw() {
        this.image.src = this.image_source 
        let x = this.position.x - this.image.width / 2;
        let y = this.position.y - this.image.height / 2;
        c.drawImage(this.image, x, y)
    }
}

class Projectile extends Entity {
    static fireRate = 50 
    constructor(position, direction, radius, color, projectileSpeed = 1, projectileDamage = 5) {
        super(position, direction, radius, color)
        this.projectileSpeed = projectileSpeed
        this.projectileDamage = projectileDamage
    }

    fire() {
        let dx = this.direction.x - this.position.x
        let dy = this.direction.y - this.position.y
        let angle = Math.atan2(dy, dx)
        this.velocity.x = Math.cos(angle) * this.projectileSpeed
        this.velocity.y = Math.sin(angle) * this.projectileSpeed
    }

    update(delta) {
        this.position.x += this.velocity.x * delta
        this.position.y += this.velocity.y * delta
    }
}

function fireProjectile() {
    let newProjectile = new Projectile({x: player.position.x, y: player.position.y}, {x: mouse.x, y: mouse.y}, 5, "#ff0000")
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

const player = new Entity(
    {x: canvas.width/2, y: canvas.height/2},
    {x: 0, y: 0},
    10,
    "#88c0d0",
)

function spawnGhost() {
    let x = Math.random() * canvas.width
    let y = 100
    let normal_ghost = "assets/ghost.png"
    let red_ghost = "assets/ghost_red.png"

    let red_chance = Math.random() * 100

    if (red_chance > 90) {
        ghosts.push(new Ghost({x: x, y: y}, 200, 600, red_ghost))
    } else {
        ghosts.push(new Ghost({x: x, y: y}, 50, 100, normal_ghost))
    }
}


addEventListener("keydown", e => {
    keys[e.key] = true
})

addEventListener("keyup", e => {
    keys[e.key] = false 
})

addEventListener("mousedown", e => {
    isShooting = true
})

addEventListener("mouseup", e => {
    isShooting = false
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
}

function game_loop(timestamp) {
    clear_screen()
    let delta = timestamp - last_timestamp

    if (keys.a) {
        player.direction.x = -1
    } else if (keys.d) {
        player.direction.x = 1
    } else {
        player.direction.x = 0
    }
    
    if (keys.s) {
        player.direction.y = 1
    } else if (keys.w) {
        player.direction.y = -1
    } else {
        player.direction.y = 0
    }
    
    if (keys.p) {
        show_easter_egg()
        keys.p = false
    }

    if (isShooting) {
        if (timestamp > last_fire) {
            fireProjectile()
            last_fire = timestamp + Projectile.fireRate
        }
    }
    
    player.update(delta)
    player.draw()
    
    ghosts.forEach(ghost => {
        ghost.update(delta)
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


    
    fps = 1000 / delta
    draw_fps("FPS: " + Math.round(fps))
    draw_score()
    
    last_timestamp = timestamp

    if (!player.dead) {
        requestAnimationFrame(game_loop)
    } else {
        clearInterval(ghostSpawner)
        clear_screen()
        canvas.style.display = "none"
        deadboi.style.display = "block"
    }
}
requestAnimationFrame(game_loop)
const ghostSpawner = setInterval(spawnGhost, 1000)


