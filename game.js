const canvas = document.querySelector("#game-layer")

/** @type {CanvasRenderingContext2D} */
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight
let projectiles = []
let isShooting = false
let mouse = {x: 0, y: 0}

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

class Entity {
    constructor(position, direction, radius, color) {
        this.position = position
        this.direction = direction
        this.velocity = {x: 0, y: 0}
        this.radius = radius
        this.color = color
        this.speed = 1 
    }

    update(delta) {
        this.velocity.y = this.direction.y * delta
        this.velocity.x = this.direction.x * delta

        this.position.x += this.velocity.x / 2
        this.position.y += this.velocity.y / 2
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile extends Entity {
    static fireRate = 50 
    constructor(position, direction, radius, color, projectileSpeed) {
        super(position, direction, radius, color)
        this.projectileSpeed = projectileSpeed
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
    let newProjectile = new Projectile({x: player.position.x, y: player.position.y}, {x: mouse.x, y: mouse.y}, 5, "#ff0000", 1)
    newProjectile.fire()
    projectiles.push(newProjectile)
}

const player = new Entity(
    {x: canvas.width/2, y: canvas.height/2},
    {x: 0, y: 0},
    10,
    "#88c0d0",
)

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
    c.font = "30px Arial"
    c.fillText(value, 10, 40)
}

function game_loop(timestamp) {
    c.clearRect(0, 0, canvas.width, canvas.height)
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
    
    if (isShooting) {
        if (timestamp > last_fire) {
            fireProjectile()
            last_fire = timestamp + Projectile.fireRate
        }
    }
    
    projectiles.forEach((projectile, index) => {
        if (projectile.position.x > 0 && projectile.position.x < canvas.width && 
            projectile.position.y > 0 && projectile.position.y < canvas.height) {
            projectile.update(delta)
            projectile.draw()
        } else {
            projectiles.splice(index, 1)
        }
    })


    player.update(delta)
    player.draw()
    
    fps = 1000 / delta
    draw_fps("FPS: " + Math.round(fps))
    
    last_timestamp = timestamp
    requestAnimationFrame(game_loop)
}
requestAnimationFrame(game_loop)


