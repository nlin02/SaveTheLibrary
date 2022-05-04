import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from '../eventcenter/EventCenter'
import ObstaclesController from './ObstaclesController'


type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {

    private scene: Phaser.Scene

    private map: Phaser.Tilemaps.Tilemap
    private groundLayer: Phaser.Tilemaps.TilemapLayer
    
    private sprite: Phaser.Physics.Matter.Sprite
    private stateMachine: StateMachine

    private cursors: CursorKeys

    private yellowParticles
    private yellowParticleEmitter

    private obstacles: ObstaclesController
    private lastscorpion?: Phaser.Physics.Matter.Sprite

    private speed = 7
    private aboveZero
    private startTime:number
    private remTime:number // TODO: UPDATE

    private isStunned = false
    private stunTime = 0
    private stunLength = 300

    private isSuperSpeed = false
    private speedTime = 0
    private speedLength = 300

    private idleState : string

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys, obstacles: ObstaclesController, map: Phaser.Tilemaps.Tilemap, layer: Phaser.Tilemaps.TilemapLayer, levelTime: number, yellowParticles) {
        this.scene = scene
        this.sprite = sprite
        this.yellowParticles = yellowParticles
        this.cursors = cursors
        this.obstacles = obstacles

        this.map = map
        this.groundLayer = layer

        this.stateMachine = new StateMachine(this, 'player')

        this.aboveZero = true
        this.startTime = levelTime
        this.remTime = this.startTime
    
        this.createAnimations()
        this.createParticleEmitter()

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
        .addState('swim', {
            onEnter: this.swimOnEnter,
            onUpdate: this.swimOnUpdate,
            onExit: this.swimOnExit
        })
        .addState('swim-idle', {
            onEnter: this.swimIdleOnEnter,
            onUpdate: this.swimIdleOnUpdate,
            onExit: this.swimOnExit
        })
        .addState('climb-idle', {
            onEnter: this.climbIdleOnEnter,
            onUpdate: this.climbIdleOnUpdate,
        })
        .addState('spike-hit', {
            onEnter: this.spikeHitOnEnter
        })
        .addState('scorpion-hit', {
            onEnter: this.scorpionHitOnEnter
        })
        .addState('star-speed', {
            onEnter: this.starSpeedOnEnter
        })
        .addState('scorpion-stomp', {
            onEnter: this.scorpionStompOnEnter
        })
        .addState('dead',{
            onEnter: this.deadOnEnter
        })
        .setState('idle')

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {

            const body = data.bodyB as MatterJS.BodyType // body being collided on
            const gameObject = body.gameObject
            
            if (this.checkCollisionForDamage(body)) {
                return
            }

            if (!gameObject) {
                return
            }

            this.checkLandingAfterJump()

            const sprite = gameObject as Phaser.Physics.Matter.Sprite
            const type = sprite.getData('type') // as long as it has a type, we will get not get undefined 
            
            switch (type){ // do something depending on the type
                case 'star': {
                    this.destroyStar(sprite)
                    events.emit('star-collected')
                    this.scene.sound.play('powerup')
                    this.stateMachine.setState('star-speed')
                    break
                }

                case 'Professor': {        
                    this.scene.sound.play('levelchange')
                    this.scene.sound.removeByKey('housemusic')
                    this.scene.sound.play('tombmusic')
                    this.scene.scene.start('win')
                    break
                }

                case 'time-machine': {
                    this.scene.sound.play('levelchange')
                    this.scene.sound.removeByKey('housemusic')
                    this.scene.sound.play('tombmusic')
                    this.scene.scene.start('travel')
                    break
                }

                case 'exit-door': {
                    this.scene.sound.play('levelchange')
                    this.scene.sound.removeByKey('tombmusic')
                    this.scene.sound.play('egyptmusic')
                    this.scene.scene.start('LevelAlexandria')
                    break
                }
            }
        })
    }

    update(dt: number) {
        this.stateMachine.update(dt)
        if (this.aboveZero) { // duplication code, but ensures that method updateTime is not being called ALL THE TIME 
            this.updateTime()
            this.handleSpeedStunLogic()
        }

    }

    private createParticleEmitter() {
        this.yellowParticleEmitter = this.yellowParticles.createEmitter({
            x: 30,
            y: 5, 
            speed: 200,
            scale: { start: 0.3, end: 0, ease: 'Quad.easeOut'},
            blendMode: 'ADD',
            lifespan: 1000,
            alpha: 0.4,
            visible: false,
            deathZone: { type: 'onEnter', source: this.sprite.getBounds() }
        });
        this.yellowParticleEmitter.startFollow(this.sprite, -5, 30);
    }

    private handleSpeedStunLogic() {
        if(this.isStunned && !this.isSuperSpeed) {
            if (this.stunTime > this.stunLength) {
                this.resetSpeedStunLogic()
            }
            this.stunTime ++
        }

        if(this.isSuperSpeed && !this.isStunned) {
            if (this.speedTime > this.speedLength) {
                this.resetSpeedStunLogic()
            }
            this.speedTime ++
        }
    }

    private resetSpeedStunLogic() {
        this.sprite.clearTint()
        this.yellowParticleEmitter.setVisible(false)
        this.speed = 7
        this.isStunned = false
        this.isSuperSpeed = false
        this.stunTime = 0
        this.speedTime = 0
    }

    // ------------- Idle State --------------

    private idleOnEnter() {
        this.sprite.play('player-idle')
        this.idleState = 'idle'
        
    }

    private idleOnUpdate() {
        this.idleState = 'idle'
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.stateMachine.setState('walk')
        }
        
        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }

        this.checkClimbing()
        this.checkSwimming()
    }

    // ------------- Walk State --------------

    private walkOnEnter() {
        this.sprite.play('player-walk')
    }

    private walkOnUpdate() {
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
        this.checkSwimming()
        this.checkClimbing()

    }

    // ------------- Jump State --------------

    private jumpOnEnter() {
        this.sprite.setFriction(0) //make the sprite slippery in the air
        this.sprite.setVelocityY(-15)
        this.checkSwimming()
    }

    private jumpOnUpdate() {
        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-5)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(5)
        }
        this.checkSwimming()
        this.checkClimbing()
    }

    private jumpOnExit() {
        this.sprite.setFriction(0.45)
    }

    // ------------- Check Landing After Jump Handler --------------

    private checkLandingAfterJump() {
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
    }

    // ------------- Check Swimming Handler --------------
    private checkSwimming() {
        if (!this.stateMachine.isCurrentState('swim')) {
            const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

            if (tile.properties.canSwim) {
                this.stateMachine.setState('swim');
                // console.log("IN SWIMMING STATE")
            }
        }
    }

    // ------------- Swim State --------------

    private swimOnEnter() {
        this.sprite.setIgnoreGravity(true)
        this.sprite.setTint(0x3275a8)
        this.sprite.setVelocity(0,0)
        this.sprite.play('player-swim')
    }

    private swimOnUpdate() {
        const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);
        const speedMod = 3

        this.sprite.setTint(0x3275a8)

        if (this.cursors.up.isDown || this.cursors.space.isDown) {
            this.sprite.setVelocityY(-this.speed + speedMod) //this.sprite.setVelocityY(-this.speed) 
            this.sprite.setIgnoreGravity(true)
        } 
        else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(this.speed - speedMod)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-this.speed + speedMod)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(this.speed - speedMod)
            this.sprite.setIgnoreGravity(true)
        }
        else if (this.stateMachine.isCurrentState('swim')) {
            this.sprite.setVelocity(0,0)
            this.sprite.setIgnoreGravity(true)
            this.stateMachine.setState('swim-idle');
        }

        if (!tile.properties.canSwim) {
            this.sprite.setIgnoreGravity(false)
            this.stateMachine.setState('idle');
        }
    }

    private swimOnExit() {
        this.sprite.clearTint()
        this.sprite.setIgnoreGravity(false)
    }

    // ------------- Swim Idle State --------------
    
    private swimIdleOnEnter() {
        this.sprite.setVelocityY(1)
        this.sprite.setTint(0x3275a8)
        this.sprite.setIgnoreGravity(true)
        this.idleState = "swim-idle"
    }

    private swimIdleOnUpdate() {
        const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);
        this.sprite.setTint(0x3275a8)
        this.idleState = "swim-idle"

        if (this.cursors.up.isDown || this.cursors.down.isDown) {
            this.stateMachine.setState('swim')
        }
        if (this.cursors.space.isDown) {
            this.stateMachine.setState('jump')
        }
        else if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.stateMachine.setState('swim')
        }

        if (!tile.properties.canSwim) {
            this.sprite.setIgnoreGravity(false)
            this.stateMachine.setState('swim-idle');
        }
    }

    // ------------- Check Climbing Handler --------------

    private checkClimbing() {
        if ((this.cursors.up.isDown || this.cursors.down.isDown) && !this.stateMachine.isCurrentState('climb')) {
            const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

            if (tile.properties.canClimb) {
                this.stateMachine.setState('climb');
            }
        }
    }

    // ------------- Climb State --------------

    private climbOnEnter() {
        this.sprite.setIgnoreGravity(true)
        this.sprite.setVelocity(0,0)
        this.sprite.play('player-climb')
    }

    private climbOnUpdate() {
        const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

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
            this.stateMachine.setState('climb-idle');
        }

        if (!tile.properties.canClimb) {
            this.sprite.setIgnoreGravity(false)
            this.stateMachine.setState('idle');
        }
    }

    private climbOnExit() {
        this.sprite.setIgnoreGravity(false)
    }

    // ------------- Climb Idle State --------------
    
    private climbIdleOnEnter() {
        this.sprite.setIgnoreGravity(true)
        this.sprite.setVelocity(0,0)
        this.sprite.play('player-climb-idle')
    }

    private climbIdleOnUpdate() {
        const tile = this.map.getTileAt(Math.floor(this.sprite.x / 72), Math.floor(this.sprite.y / 72), true, this.groundLayer);

        if (this.cursors.up.isDown || this.cursors.down.isDown) {
            this.stateMachine.setState('climb')
        }
        else if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.stateMachine.setState('climb')
        }

        if (!tile.properties.canClimb) {
            this.sprite.setIgnoreGravity(false)
            this.stateMachine.setState('idle');
        }
    }

    // ------------- Check Collision For Damage Handler --------------

    private checkCollisionForDamage(body: MatterJS.BodyType) {
        if (this.obstacles.is('spikes', body)) {
            this.stateMachine.setState('spike-hit')
            return true
        }

        if (this.obstacles.is('spikeMoveUp', body)) {
            this.stateMachine.setState('spike-hit')
            return true
        }

        if (this.obstacles.is('fire', body)) {
            this.stateMachine.setState('spike-hit')
            return true
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
            return true
        }

        return false
    }

    // ------------- Stun Player Handler --------------

    private stunPlayer() {
        this.isStunned = true
        this.speed = 4
       
        // red and white color
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0xc22626)

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
            },
            onComplete: () => {
                this.sprite.setTint(0xc22626)
            }
        })
        this.stateMachine.setState(this.idleState)
    }


    // ------------- Spike Hit State --------------

    private spikeHitOnEnter() {
        this.scene.sound.play('spikehit')
        this.sprite.clearTint()
        this.sprite.setVelocityY(-12)

        if(this.isSuperSpeed) {
            this.resetSpeedStunLogic()
            this.stateMachine.setState('idle')
            return
        }
        this.stunPlayer()
    }


    // ------------- Scorpion Hit State --------------

    private scorpionHitOnEnter() {
        this.scene.sound.play('scorpionhit')
        this.sprite.clearTint()
        if (this.lastscorpion) {
            // move left if left of scorpion
            if (this.sprite.x < this.lastscorpion.x) {
                this.sprite.setVelocityX(-20)
            }
            else {
                this.sprite.setVelocityX(20)
            }
        }
        else {
            this.sprite.setVelocityY(-20)
        }

        if(this.isSuperSpeed) {
            this.resetSpeedStunLogic()
            this.stateMachine.setState('idle')
            return
        }
        this.stunPlayer()
    }

    // ------------- Scorpion Stomp State --------------

    private scorpionStompOnEnter() {
        this.scene.sound.play('scorpionstomp')
        this.sprite.setVelocityY(-10)
        events.emit('scorpion-stomped', this.lastscorpion)
        this.stateMachine.setState('idle')
    }

    // ------------- Dead State --------------

    private deadOnEnter() {
        this.sprite.play('player-death')
        this.sprite.setOnCollide(() => {})
        this.scene.time.delayedCall(1500, () => {
            this.scene.scene.start('game-over')
        })
    }

    // ------------- Update Time Handler --------------

    private updateTime() {
        if(this.remTime === this.startTime) {
            events.emit('startedTime', this.remTime)
        }
        if (this.remTime > 0) {
            this.remTime -= 0.1
            events.emit('timerIncrement', this.remTime)
        }
        else {

            this.aboveZero = false
            this.stateMachine.setState('dead')
        }
    }

    // ------------- Collect Star Method --------------
//never used?!?!?! 
    private collectStar(sprite: Phaser.Physics.Matter.Sprite) {
        events.emit('star-collected')
        sprite.destroy()
    }



    // ---------------- Super Speed Method --------------
    private starSpeedOnEnter() {
        if(this.isStunned) {
            this.resetSpeedStunLogic()
            this.stateMachine.setState('idle')
            return
        }
        this.yellowParticleEmitter.setVisible(true)
        
        this.isSuperSpeed = true
        this.speed = 9       
        this.sprite.setTint(0xffff00) //yellow
        this.stateMachine.setState('idle')
    }

    private destroyStar(sprite: Phaser.Physics.Matter.Sprite) {
        sprite.destroy()
    }


    // ------------- Switch Scene Method --------------

    private switchScene(sprite: Phaser.Physics.Matter.Sprite) {
        events.emit('changeScene', sprite.getData('targetScene'))
    }

    // ------------- Create Animations --------------

    private createAnimations() {
        this.sprite.anims.create({
            key: 'player-idle',
            frames: this.sprite.anims.generateFrameNames('explorer', {
                start: 1, 
                end: 2, 
                prefix: 'explorer_idle0',
                suffix: '.png'
            }),
            repeat: -1,
            frameRate: 5
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
            frames: this.sprite.anims.generateFrameNames('explorer', {
                start: 1,
                end: 5, 
                prefix: 'explorer_die0',
                suffix: '.png'
            })
        })

        this.sprite.anims.create({
            key: 'player-climb',
            frames: this.sprite.anims.generateFrameNames('explorer', {
                start: 1,
                end: 3, 
                prefix: 'explorer_climb0',
                suffix: '.png'
            }),
            repeat: -1,
            frameRate: 10
        })

        this.sprite.anims.create({
            key: 'player-climb-idle',
            frames: [{
                key: 'explorer',
                frame: 'explorer_climb02.png'          
            }]
        })

        this.sprite.anims.create({
            key: 'player-swim',
            frames: this.sprite.anims.generateFrameNames('explorer', {
                start: 1,
                end: 4, 
                prefix: 'explorer_swim0',
                suffix: '.png'
            }),
            repeat: -1,
            frameRate: 10
        })
    }
}