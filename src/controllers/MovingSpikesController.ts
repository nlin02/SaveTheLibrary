import { Physics } from "phaser";
import StateMachine from "../StateMachine/StateMachine";
import { sharedInstance as events} from "../scenes/EventCenter";

export default class MovingSpikesController {
    private scene: Phaser.Scene
    private sprite: Physics.Matter.Sprite
    private stateMachine: StateMachine
    private moveTime = 0

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite = sprite
        this.stateMachine = new StateMachine(this, 'spikesMoveUp')

        // this.createAnimations()

        this.stateMachine.addState('idle')
            .addState('idle', {
                onEnter: this.idleOnEnter
            })
            .addState('move-up', {
                onEnter: this.moveUpOnEnter,
                onUpdate: this.moveUpOnUpdate
            })
            .addState('move-down', {
                onEnter: this.moveDownOnEnter,
                onUpdate: this.moveDownOnUpdate
            })
            .setState('move-down')
        
        this.sprite.setMass(10000000)
        this.sprite.setIgnoreGravity(true)

    }

    update(dt: number) {
        this.stateMachine.update(dt)
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: 'idle',
            // key of the texture (game.ts preload)
            frames: [{key: 'spikeMoveUp', frame: 'spikeMoveUp.png'}]
        })
        this.sprite.anims.create({ 
            key: 'move-left',
            frames: this.sprite.anims.generateFrameNames('snowman', {
                start: 1,
                end: 2,
                prefix: 'snowman_left_',
                suffix: '.png' 
            }),
            frameRate: 5,
            repeat: -1
        })
        this.sprite.anims.create({
            key: 'move-right',
            frames: this.sprite.anims.generateFrameNames('snowman', {
                start: 1,
                end: 2,
                prefix: 'snowman_right_',
                suffix: '.png'
            }),
            frameRate: 5,
            repeat: -1
        })
    }

    private idleOnEnter() {
        this.sprite.play('idle')
        const rand = Phaser.Math.Between(1,100)
        if(rand < 50) {
            this.stateMachine.setState('move-up')
        }
        else {
            this.stateMachine.setState('move-down')
        }
    }

    private moveUpOnEnter() {
        this.moveTime = 0
		// this.sprite.play('move-left')
    }

    private moveUpOnUpdate(dt: number) {
        this.moveTime += dt
        this.sprite.setVelocityY(-4)
        // this.sprite.setX()

        // if moveTime is greater than 2000 ms, change state to right
        if(this.moveTime > 1200) {
            this.stateMachine.setState('move-down')
        }
    }

    private moveDownOnEnter() {
        this.moveTime = 0
		// this.sprite.play('move-right')
    }

    private moveDownOnUpdate(dt: number) {
        this.moveTime += dt
        this.sprite.setVelocityY(4)


        if(this.moveTime > 1200) {
            this.stateMachine.setState('move-up')
        }
    }

}