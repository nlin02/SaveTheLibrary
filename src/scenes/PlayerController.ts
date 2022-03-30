import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from './EventCenter'
import ObstaclesController from './ObstaclesController'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {

    private scene: Phaser.Scene
    
    private sprite: Phaser.Physics.Matter.Sprite

    private cursors: CursorKeys

    private obstacles: ObstaclesController

    private stateMachine: StateMachine
    private health = 100
    private time =0;
    private speed = 0

    private lastSnowman?: Phaser.Physics.Matter.Sprite

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys, obstacles: ObstaclesController) {
        this.scene = scene
        this.sprite = sprite
        this.cursors = cursors
        this.obstacles = obstacles
        this.createAnimations()
        this.stateMachine = new StateMachine(this, 'player')

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleOnUpdate
        })
        .addState('walk', {
            onEnter: this.walkOnEnter,
            onUpdate: this.walkOnUpdate
        })
        .addState('jump', {
            onEnter: this.jumpOnEnter,
            onUpdate: this.jumpOnUpdate
        })
        .addState('spike-hit', {
            onEnter: this.spikeHitOnEnter
        })
        .addState('snowman-hit', {
            onEnter: this.snowmanHitOnEnter
        })
        .addState('snowman-stomp', {
            onEnter: this.snowmanStompOnEnter
        })
        .addState('dead',{
            onEnter: this.deadOnEnter
        })
        .setState('idle')

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {

            const body = data.bodyB as MatterJS.BodyType // body being collided on
            const gameObject = body.gameObject
            
            if (this.obstacles.is('spikes', body)) {
                this.stateMachine.setState('spike-hit')
                return
            }

            if (this.obstacles.is('snowman', body)) {
                this.lastSnowman = body.gameObject

                // if sprite is on top of snowman, stomp and kill snowman
                if(this.sprite.y < body.position.y) {
                    this.stateMachine.setState('snowman-stomp')
                }
                // hit by snowman, penguin gets hurt
                else {
                    this.stateMachine.setState('snowman-hit')
                }
                return
            }

            if (!gameObject){
                return
                
            }

            // if (gameObject instanceof Phaser.Physics.Matter.TileBody){ // allows double jumps
                
                if(this.stateMachine.isCurrentState('jump')){
                    this.stateMachine.setState('idle')
                }
                // return 
            // }
            const sprite = gameObject as Phaser.Physics.Matter.Sprite
            const type = sprite.getData('type') // as long as it has a type, we will get not get undefined 
            
            switch (type){ // do something depending on the type
                
                case 'star':
                    {
                        events.emit('star-collected')
                        sprite.destroy()
                        break
                    }

                case 'health':{
                    const value = sprite.getData('healthPoints') ?? 10 // ?? means if there is no data, we default to the # following after. 
                    this.health = Phaser.Math.Clamp(this.health + value, 0, 100)  // clamps to to 0 to 100, cannot exceed 100 
                    events.emit('health-changed', this.health)
                    sprite.destroy()
                    break
                }
            }

            
        })
    }

    update(dt: number) {
        this.stateMachine.update(dt)
        // events.emit('timer-update', this.time) 
    }

    private setHealth(value: number){
        this.health = value // this is it. 

        events.emit('health-changed', this.health)

        if (this.health <= 0) {
            this.stateMachine.setState('dead')
        }

    }

    private idleOnEnter(){
        this.sprite.play('player-idle')
    }

    private idleOnUpdate(){
        if (this.cursors.left.isDown || this.cursors.right.isDown){
            this.stateMachine.setState('walk')
        }
        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }
    }

    private walkOnEnter(){
        this.sprite.play('player-walk')
    }

    private walkOnUpdate(){
        this.speed = 7

        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-this.speed)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(this.speed)
        }
        else {
            this.sprite.setVelocityX(0)
            this.stateMachine.setState('idle')
        }

        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }
    }

    private jumpOnEnter(){
        this.sprite.setVelocityY(-15)
    }

    private jumpOnUpdate(){
        this.speed = 7

        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-this.speed)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(this.speed)
        }
    }

    private spikeHitOnEnter() {
        this.sprite.setVelocityY(-12)
        this.speed = 2

        // red and white color
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000)

        this.stateMachine.setState('idle')

        // sets penguin tint to move from white to red every 100ms when a spike is hit
        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue()
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    value
                )
                const color = Phaser.Display.Color.GetColor(
                    colorObject.r,
                    colorObject.g,
                    colorObject.b
                )

                this.sprite.setTint(color)
            }
        })
        this.stateMachine.setState('idle')

        this.setHealth(this.health-10)
    }

    private snowmanHitOnEnter() {
        if(this.lastSnowman) {
            // move left if left of snowman
            if(this.sprite.x < this.lastSnowman.x) {
                this.sprite.setVelocityX(-20)
            }
            else {
                this.sprite.setVelocityX(20)
            }
        }
        else {
            this.sprite.setVelocityY(-20)
        }

        // blue and white color
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0x0000ff)


        // sets penguin tint to move from white to red every 100ms when a spike is hit
        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue()
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    value
                )
                const color = Phaser.Display.Color.GetColor(
                    colorObject.r,
                    colorObject.g,
                    colorObject.b
                )

                this.sprite.setTint(color)
            }
        })

        this.stateMachine.setState('idle')

        this.setHealth(this.health - 10)

        
    }

    private snowmanStompOnEnter() {
        this.sprite.setVelocityY(-10)
        events.emit('snowman-stomped', this.lastSnowman)
        this.stateMachine.setState('idle')
    }

    private deadOnEnter(){
        this.sprite.play('player-death')
        this.sprite.setOnCollide(() => {})
        this.scene.time.delayedCall(1600, () => {
            this.scene.scene.start('game-over')
        })
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: 'player-idle',
            frames: [{
                key: 'penguin',
                frame: 'penguin_walk01.png'
            }]
        })

        this.sprite.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('penguin', {
                start: 1, 
                end: 4, 
                prefix: 'penguin_walk0',
                suffix: '.png'
            }),
            repeat: -1
        })

        this.sprite.anims.create({
            key: 'player-death',
            frames: this.sprite.anims.generateFrameNames('penguin', {
                start: 1,
                end: 4, 
                prefix: 'penguin_die',
                zeroPad: 2,
                suffix: '.png'
            }),
            frameRate: 10
            })
    }
}