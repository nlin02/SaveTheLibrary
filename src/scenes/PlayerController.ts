import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {
    
    private sprite: Phaser.Physics.Matter.Sprite

    private cursors: CursorKeys

    private stateMachine: StateMachine

    constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys) {
        this.sprite = sprite
        this.cursors = cursors
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
        .setState('idle')

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {

            const body = data.bodyB as MatterJS.BodyType // body being collided on
            const gameObject = body.gameObject

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
            
            switch (type){ // do s omething depending on the type
                
                case 'star':
                    {
                        events.emit('star-collected')
                        sprite.destroy()
                        break
                    }
            }

            
        })
    }

    update(dt: number) {
        this.stateMachine.update(dt)
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
        const speed = 7

        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-speed)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(speed)
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
        const speed = 7

        if (this.cursors.left.isDown) {
            this.sprite.flipX = true
            this.sprite.setVelocityX(-speed)
        }
        else if (this.cursors.right.isDown) {
            this.sprite.flipX = false
            this.sprite.setVelocityX(speed)
        }
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
    }
}