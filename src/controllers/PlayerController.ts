import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from '../EventCenter'
import ObstaclesController from './ObstaclesController'
import { autorun } from 'mobx'
import { timer } from '.././header/Timer'


type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {

    private scene: Phaser.Scene
    
    private sprite: Phaser.Physics.Matter.Sprite

    private cursors: CursorKeys

    private obstacles: ObstaclesController

    private map: Phaser.Tilemaps.Tilemap
    private groundLayer: Phaser.Tilemaps.TilemapLayer

    private stateMachine: StateMachine
    private health = 100
    private time = 100;
    private speed = 7

    private lastscorpion?: Phaser.Physics.Matter.Sprite

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys, obstacles: ObstaclesController, map: Phaser.Tilemaps.Tilemap, layer: Phaser.Tilemaps.TilemapLayer) {
        this.scene = scene
        this.sprite = sprite
        this.cursors = cursors
        this.obstacles = obstacles
        this.map = map
        this.groundLayer = layer
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
            onUpdate: this.jumpOnUpdate,
            onExit: this.jumpOnExit
        })
        .addState('climb', {
            onEnter: this.climbOnEnter,
            onUpdate: this.climbOnUpdate,
            onExit: this.climbOnExit
        })
        .addState('spike-hit', {
            onEnter: this.spikeHitOnEnter
        })
        .addState('scorpion-hit', {
            onEnter: this.scorpionHitOnEnter
        })
        .addState('scorpion-stomp', {
            onEnter: this.scorpionStompOnEnter
        })
        .addState('dead',{
            onEnter: this.deadOnEnter
        })
        .addState('times-up', {
            onEnter: this.timesUp
        })
        .setState('idle')

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {

            const body = data.bodyB as MatterJS.BodyType // body being collided on
            const gameObject = body.gameObject
            
            if (this.obstacles.is('spikes', body)) {
                this.stateMachine.setState('spike-hit')
                return
            }

            if (this.obstacles.is('spikeMoveUp', body)) {
                this.stateMachine.setState('spike-hit')
                return
            }

            if (this.obstacles.is('scorpion', body)) {
                this.lastscorpion = body.gameObject

                // if sprite is on top of scorpion, stomp and kill scorpion
                if(this.sprite.y + 20 < body.position.y) {
                    this.stateMachine.setState('scorpion-stomp')
                }
                // hit by scorpion, penguin gets hurt
                else {
                    this.stateMachine.setState('scorpion-hit')
                }
                return
            }

            if (!gameObject){
                return
            }

            if(this.stateMachine.isCurrentState('jump')) {
                const tile = this.map.getTileAt(
                    Math.floor((this.sprite.getBottomCenter().x) / 72),
                    Math.floor((this.sprite.getBottomCenter().y + 1) / 72),
                    true, this.groundLayer);
                if (tile) {
                    if(tile.properties.collides) {
                        this.stateMachine.setState('idle')
                    }
                }
            }


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

                case 'piglet':{
                    console.log('touched piglet!')
                    Phaser.Scenes.Events.SHUTDOWN
                    this.scene.scene.start('levelTwo')
                    break
                }
            }

            
        })
    }

    update(dt: number) {
        this.stateMachine.update(dt)
        timer.sharedText -= 0.1
        events.emit('timer-update', this.time) 
        events.on('times-up', this.timesUp, this)
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

        // Handle hero climbing
        if ((this.cursors.up.isDown || this.cursors.down.isDown) && !this.stateMachine.isCurrentState('climb')) {
            const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

            if (tile.properties.canClimb) {
                this.stateMachine.setState('climb');
            }
        }
    }

    private walkOnEnter(){
        this.sprite.play('player-walk')
    }

    private walkOnUpdate(){
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

        // Handle hero climbing
        if ((this.cursors.up.isDown || this.cursors.down.isDown) && !this.stateMachine.isCurrentState('climb')) {
            const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

            if (tile.properties.canClimb) {
                this.stateMachine.setState('climb');
            }
        }

    }

    private jumpOnEnter(){
        this.sprite.setFriction(0) //make the sprite slippery in the air
        this.sprite.setVelocityY(-15)
    }

    private jumpOnUpdate(){
        
        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-this.speed)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(this.speed)
        }
    }

    private jumpOnExit() {
        this.sprite.setFriction(0.45)
    }

    private climbOnEnter(){
        console.log("climbing")
        this.sprite.setIgnoreGravity(true)
        this.sprite.setVelocity(0,0)
    }

    private climbOnUpdate(){
        const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

        // Handle climbing movement
        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-this.speed)
            this.sprite.setIgnoreGravity(true)
        } 
        else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(this.speed)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-this.speed)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(this.speed)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.stateMachine.isCurrentState('climb')) {
            this.sprite.setVelocity(0,0)
            this.sprite.setIgnoreGravity(true)
        }

        if (!tile.properties.canClimb) {
            this.sprite.setIgnoreGravity(false)
            this.stateMachine.setState('idle');
        }
    }

    private climbOnExit() {
        this.sprite.setIgnoreGravity(false)
    }

    private spikeHitOnEnter() {
        this.sprite.setVelocityY(-12)
        
        if(this.speed <= 1) {
            this.speed = 1
        }
        else {
            // this.speed = this.speed - 2
            console.log(`speed: ${this.speed}`)
        }

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

    private scorpionHitOnEnter() {
        if(this.lastscorpion) {
            // move left if left of scorpion
            if(this.sprite.x < this.lastscorpion.x) {
                this.sprite.setVelocityX(-20)
            }
            else {
                this.sprite.setVelocityX(20)
            }
        }
        else {
            this.sprite.setVelocityY(-20)
        }

        if(this.speed <= 1) {
            this.speed = 1
        }
        else {
            this.speed = this.speed - 1
            console.log(`speed: ${this.speed}`)
        }

        // blue and white color
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0x00ff00)


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

    private scorpionStompOnEnter() {
        this.sprite.setVelocityY(-10)
        events.emit('scorpion-stomped', this.lastscorpion)
        this.stateMachine.setState('idle')
    }

    private deadOnEnter(){
        this.sprite.play('player-death')
        this.sprite.setOnCollide(() => {})
        this.scene.time.delayedCall(1600, () => {
            this.scene.scene.start('game-over')
        })
    }
    
    private timesUp(){
        // this.sprite.setOnCollide(() => {})
        timer.sharedText = 100 //reset
        this.stateMachine.setState("times-up")
        // this.scene.time.delayedCall(1, () => {
            this.scene.scene.start('game-over')
        // })
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: 'player-idle',
            frames: [{
                key: 'explorer',
                frame: 'explorer_walk.png'
            }]
        })

        this.sprite.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('explorer', {
                start: 1, 
                end: 6, 
                prefix: 'explorer_walk0',
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

        // NEED TO CREATE CLIMBING ANIMATION!!!!!
    }
}