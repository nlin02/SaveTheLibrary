import Phaser from 'phaser'

export default class MovingSpikeController extends Phaser.Physics.Matter.Sprite
{
	private startX
	private startY
	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 * @param {Phaser.Types.Physics.Matter.MatterBodyConfig} options 
	 */
	constructor(scene, x, y, texture, options)
	{
		super(scene.matter.world, x, y, texture, 0, options)

		scene.add.existing(this)
		this.createAnimations()
		this.play('move')
		this.startY = y
		this.startX = x
		this.setFriction(1, 0, Infinity)
	}

	moveVertically() {
		this.scene.tweens.addCounter({
			from: 0,
			to: -300,
			duration: 1500,
			ease: Phaser.Math.Easing.Sine.InOut,
			repeat: -1,
			yoyo: true,
			onUpdate: (tween, target) => {
				const y = this.startY - target.value
				const dy = y + this.y
				this.y = y
				this.setVelocityY(dy)
			}
		})
	}

	createAnimations() {
        this.anims.create({ 
            key: 'move',
            frames: this.anims.generateFrameNames('spikesMoveUp', {
                start: 1,
                end: 8,
                prefix: 'spikeMoveUp0',
                suffix: '.png' 
            }),
            frameRate: 8,
            repeat: -1
        })
    }

}