import { Physics } from "phaser";
import StateMachine from "../StateMachine/StateMachine";
import { sharedInstance as events} from "./EventCenter";

export default class ScorpionController {
    private scene: Phaser.Scene
    private sprite: Physics.Matter.Sprite
    private stateMachine: StateMachine
    private moveTime = 0

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite = sprite
        this.stateMachine = new StateMachine(this, 'scorpion')

        this.createAnimations()

        this.stateMachine.addState('idle')
            .addState('idle', {
                onEnter: this.idleOnEnter
            })
            .addState('move-left', {
                onEnter: this.moveLeftOnEnter,
                onUpdate: this.moveLeftOnUpdate
            })
            .addState('move-right', {
                onEnter: this.moveRightOnEnter,
                onUpdate: this.moveRightOnUpdate
            })
            .addState('dead')
            .setState('idle')

            events.on('scorpion-stomped', this.handleStomped, this)
    }

    destroy() {
        events.off('scorpion-stomped', this.handleStomped, this)
    }

    //statemachine needs an update function to execute each frame
    update(dt: number) {
        this.stateMachine.update(dt)
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: 'idle',
            // key of the texture (game.ts preload)
            frames: [{key: 'scorpion', frame: 'scorpForward1.png'}]
        })
        this.sprite.anims.create({ 
            key: 'move-left',
            frames: this.sprite.anims.generateFrameNames('scorpion', {
                start: 1,
                end: 4,
                prefix: 'scorpBackward',
                suffix: '.png' 
            }),
            frameRate: 5,
            repeat: -1
        })
        this.sprite.anims.create({
            key: 'move-right',
            frames: this.sprite.anims.generateFrameNames('scorpion', {
                start: 1,
                end: 4,
                prefix: 'scorpForward',
                suffix: '.png'
            }),
            frameRate: 5,
            repeat: -1
        })
    }

    private idleOnEnter() {
        this.sprite.play('idle')
        const rand = Phaser.Math.Between(1,100)
        // if random number is greater than 50, scorpion begins moving left
        if(rand < 50) {
            this.stateMachine.setState('move-left')
        }
        else {
            this.stateMachine.setState('move-right')
        }
    }

    private moveLeftOnEnter() {
        this.moveTime = 0
		this.sprite.play('move-left')
    }

    private moveLeftOnUpdate(dt: number) {
        this.moveTime += dt
        this.sprite.setVelocityX(-3)

        // if moveTime is greater than 2000 ms, change state to right
        if(this.moveTime > 2500) {
            this.stateMachine.setState('move-right')
        }
    }

    private moveRightOnEnter() {
        this.moveTime = 0
		this.sprite.play('move-right')
    }

    private moveRightOnUpdate(dt: number) {
        this.moveTime += dt
        this.sprite.setVelocityX(3)

        // if moveTime is greater than 2000 ms, change state to left
        if(this.moveTime > 2500) {
            this.stateMachine.setState('move-left')
        }
    }

    private handleStomped(scorpion: Phaser.Physics.Matter.Sprite) {
        // if stomped scorpion is not the same sprite
        if(this.sprite !== scorpion) {
            return
        }

        events.off('scorpion-stomped', this.handleStomped, this)

        // animation to make scorpion shrink on stomp
		this.scene.tweens.add({
			targets: this.sprite,
			displayHeight: 0,
			y: this.sprite.y + (this.sprite.displayHeight * 0.5),
			duration: 200,
			onComplete: () => {
				this.sprite.destroy()
			}
		})

        // if it is, set dead state
        this.stateMachine.setState('dead')
    }
}