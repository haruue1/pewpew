const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

class Entity {
    constructor(ctx, position) {
        if (this.constructor == "Entity") {
            throw new Error("Abstract class cannot be called")
        }
        this.ctx = ctx
        this.position = position
        this.velocity = {x: 0, y: 0}
    }

    update() {
        throw new Error("Unimplemented")
    }

    draw() {
        throw new Error("Unimplemented")
    }
}

class Circle extends Entity {
    constructor(ctx, position, radius, color) {
        super(ctx, position)
        this.radius = radius
        this.color = color
    }

    draw() {
        this.ctx.beginPath()
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
        this.ctx.closePath()
    }
}

class Player extends Circle {
    constructor(ctx, position, direction, radius, color) {
        super(ctx, position, radius, color)
        this.direction = direction
        this.dead = false
        this.isShooting = false
    }

    update(delta) {
        this.velocity.y = this.direction.y * delta
        this.velocity.x = this.direction.x * delta

        this.position.x += this.velocity.x / 2
        this.position.y += this.velocity.y / 2

        let min = 0 + this.radius
        let max_width = this.ctx.canvas.width - this.radius
        let max_height = this.ctx.canvas.height - this.radius

        this.position.x = clamp(this.position.x, min, max_width)
        this.position.y = clamp(this.position.y, min, max_height)
    }

}

class Ghost extends Entity {
    constructor(ctx, position, target_position, health = 100, reward = 100, image_source) {
        super(ctx, position)
        this.image = new Image()
        this.image.onload = () => {
            this.width = this.image.width
            this.height = this.image.height
        }
        this.image.src = image_source
        this.target_position = target_position
        this.health = health
        this.reward = reward
    }

    update() {
        let dx = this.target_position.x - this.position.x
        let dy = this.target_position.y - this.position.y
        let angle = Math.atan2(dy, dx)
        this.velocity.x = Math.cos(angle)
        this.velocity.y = Math.sin(angle)

        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 
    }

    draw() {
        let x = this.position.x - this.image.width / 2;
        let y = this.position.y - this.image.height / 2;
        this.ctx.drawImage(this.image, x, y)
    }
}

class Projectile extends Circle {
    static fireRate = 50 
    constructor(ctx, position, direction, radius, color, projectileSpeed = 1, projectileDamage = 5) {
        super(ctx, position, radius, color)
        this.direction = direction
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

export {
    Entity,
    Circle,
    Player,
    Ghost,
    Projectile,
}