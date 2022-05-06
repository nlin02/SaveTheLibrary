import Phaser, { Physics } from 'phaser'

export default class FinalScreen extends Phaser.Scene{

    private background: Phaser.GameObjects.Image
    private explorer: Physics.Matter.Sprite
    private professor : Phaser.GameObjects.Image

    private screenTime = 35;
    private characterScale = .3

    private status = 'professor'

    constructor() {
        super('final')
    }

    preload () {

        this.load.atlas('fire', 'assets/fire/fire.png', 'assets/fire/fire.json')
        this.load.atlas('explorer', 'assets/explorer/explorer.png', 'assets/explorer/explorer.json')

        this.load.image('library', 'assets/screenBackgrounds/finalBackground.png')
        this.load.image('travel', 'assets/screenBackgrounds/travelBackground.png')
        this.load.image('professor', 'assets/professor/professor_faint.png')


    }

    create() {
        this.sound.removeByKey('egyptmusic')
        
        const{width, height} = this.scale

        this.background = this.add.image(400,300, "library")
        this.background.setScale(.5,.5)
            .setRotation

        this.explorer = this.matter.add.sprite(0, 407, 'explorer')
        this.explorer.setScale(1,1)
            this.explorer.setIgnoreGravity(true)
            this.explorer.setStatic(false)
        
        this.professor = this.add.image(500,410, 'professor')
        this.professor.flipX = true


        this.placeFires()
        this.createExplorerAnimations()

        this.explorer.play('player-walk')
        
    }

    update() {
        
        this.screenTime -= 0.1
        if( 12 < this.screenTime) {

            this.explorer.setX(this.explorer.x + 2)
        }
        else{
            if (this.explorer.x > 0) {
                this.explorer.flipX = true
            
                this.explorer.setX(this.explorer.x - 2)
                this.professor.setX(this.professor.x - 2)

            }
            else{
                this.scene.start('prof-travel')
            }
           
        }

    }


    private placeFires() {
        const fireOne = this.matter.add.sprite(630, 430, 'fire')
        const fireTwo = this.matter.add.sprite(50, 280, 'fire')                    
        this.animateFire(fireOne)
        this.animateFire(fireTwo)

        const largeFireOne = this.matter.add.sprite(730, 400, 'fire').setScale(2,2)
        const largeFireTwo = this.matter.add.sprite(100, 180, 'fire').setScale(1.5,1.5) 

        this.animateFire(largeFireOne)
        this.animateFire(largeFireTwo)

    }

    private animateFire(fire: Physics.Matter.Sprite) {
        fire.anims.create({
            key: 'flicker-fire',
            frameRate: 10,
            frames: fire.anims.generateFrameNames('fire', {
                start: 1, 
                end: 4, 
                prefix: 'fire_0',
                suffix: '.png'
            }),
            repeat: -1
        })

        fire.play('flicker-fire')
        fire.setStatic(true)
    }

    private createExplorerAnimations(){
        this.explorer.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.explorer.anims.generateFrameNames('explorer', {
                start: 1, 
                end: 6, 
                prefix: 'explorer_walk0',
                suffix: '.png'
            }),
            repeat: -1
        })
        this.explorer.anims.create({
            key: 'player-idle',
            frames: [{
                key: 'explorer',
                frame: 'explorer_idle01.png'
            }]
        }) 
    }

}