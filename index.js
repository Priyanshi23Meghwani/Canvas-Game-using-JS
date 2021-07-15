
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
/* console.log(canvas) */
const scoreAdd = document.querySelector('#scoreAdd');
const startGameBtn = document.querySelector('#startGameBtn');
const scoreCard = document.querySelector('#scoreCard');
const finalScore = document.querySelector('#finalScore');

class Player{
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

    }
    draw(){
        c.beginPath() /*specifies that we are trying to draw on canvas*/
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
    }

}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity 
    }
    draw(){
        c.beginPath() /*specifies that we are trying to draw on canvas*/
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity 
    }
    draw(){
        c.beginPath() /*specifies that we are trying to draw on canvas*/
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

}
//for creating collision explosion

const friction = 0.99
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity 
        //to fade explosive particles
        this.alpha = 1  //indicates that initially particle will be opaque
    }
    draw(){
        c.save() //to be able to use global
        c.globalAlpha = this.alpha
        c.beginPath() /*specifies that we are trying to draw on canvas*/
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
        c.restore() // finish using global
    }
    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        //fading explosion
        this.alpha -= 0.01
    }

}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x,y,10,'white');
player.draw()
/*console.log(player)
/*projectile should move towards mouse position*/

let projectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(x,y,10,'white');
    projectiles = []
    enemies = []
    particles = []   
    score = 0
    scoreAdd.innerHTML = score
    finalScore.innerHTML = score
}

function spawnEnemies(){
    setInterval(() => { 
        const radius = Math.random()*(30-5)+5
        let x
        let y
        //for generating enemies from random points
        if(Math.random()<0.5){
            x = Math.random() < 0.5 ? 0-radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else{
            x = Math.random()*canvas.width
            y = Math.random() < 0.5 ? 0-radius : canvas.height + radius
        }

        
        //randomize enemy color
        const color = `hsl(${Math.random()*360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2-y, canvas.width / 2-x )
        const velocity = 
        {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x,y,radius,color,velocity))

    },1000)
}




let animationId
let score = 0
function animate(){
    //animationId will store the current frame
    animationId = requestAnimationFrame(animate)
    // 0.1 gives fading effect to projectiles
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    //explosion - render on screen
    particles.forEach((particle,index) => {
        //remove explosion
        if(particle.alpha <= 0){
            particles.splice(index,1)
        }
        else{
        particle.update()
        }
    });
    projectiles.forEach((projectile,index) => {
        projectile.update()
        //removing off-frame projectiles
        if((projectile.x + projectile.radius < 0) || 
           (projectile.x - projectile.radius > canvas.width) ||
           (projectile.y + projectile.radius < 0) ||
           (projectile.y - projectile.radius > canvas.height))
        {
            setTimeout(()=> {
                projectiles.splice(index,1)
            },0)
        }
    })

    enemies.forEach((enemy,index) => {
        enemy.update()
        //detecting player-enemy collision
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 1){
            //stops game and animate loop at this frame
            cancelAnimationFrame(animationId)
            scoreCard.style.display ='flex'

            finalScore.innerHTML = score

        }

        projectiles.forEach((projectile,projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            //detecting particle-enemy collision
            if(dist - enemy.radius - projectile.radius < 1)
            {   
                

                
                //explosion
                for(let i = 0; i < enemy.radius*2; i++)
                {   
                    particles.push(new Particle(projectile.x, 
                        projectile.y, 
                        Math.random()*2, 
                        enemy.color,
                        {x:(Math.random() - 0.5)*(Math.random()*6), 
                         y:(Math.random() -0.5)*(Math.random()*6)})
                        )

                }

                //removing collided enemy
                if(enemy.radius-10 >5){
                    //add score
                    score += 100
                    scoreAdd.innerHTML = score


                    //shrinking transition
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    enemy.radius -=10
                    setTimeout(() => {
                        
                        projectiles.splice(projectileIndex,1)
                        },0)

                }
                else{
                    //remove all enemies from screen bonus
                    score += 250
                    scoreAdd.innerHTML = score
                    setTimeout(() => {
                    enemies.splice(index,1)
                    projectiles.splice(projectileIndex,1)
                    },0)
                }
            }
        });
    })
}

window.addEventListener('click',(event) => { 
    console.log(projectiles)
    //console.log(event)....it gives position of mouse pointer in form of clientX & clientY
    const angle = Math.atan2(event.clientY-canvas.height / 2, event.clientX-canvas.width / 2 )
    const velocity = 
    {
        x: Math.cos(angle)*5,
        y: Math.sin(angle)*5
    }

    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            5,
            'white',
            velocity
            )
    )     
    
 })
 
startGameBtn.addEventListener('click', () =>{
    init()
    animate()
    spawnEnemies()

    scoreCard.style.display ='none'

})