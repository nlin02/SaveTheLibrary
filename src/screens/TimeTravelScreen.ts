import Phaser from 'phaser'

export default class TimeTravelScreen extends Phaser.Scene{

    private background: Phaser.GameObjects.Image
    private character: Phaser.GameObjects.Image

    private screenTime = 15;
    private characterScale = 1 

    constructor() {
        super('travel')
    }

    preload () {
        this.load.image('background', 'assets/travelbg.png');
        this.load.image('character', 'assets/explorertravel.png');
    }

    create() {
        this.sound.removeByKey('housemusic')
        
        const{width, height} = this.scale

        this.background = this.add.image(400,300, "background")
        this.background.setScale(.5,.5)
            .setRotation

        this.character = this.add.image(400,300, "character")
        this.character.setScale(this.characterScale,this.characterScale)
            .setRotation
    }

    update() {
        this.screenTime -= 0.1
        if( this.screenTime > 0) {
            this.background.rotation += 0.03
            this.updateCharacter()
        }
        else{
            this.scene.start('LevelTomb')
        }
    }

    private updateCharacter() {
        if( this.characterScale > 0) {
            this.characterScale -= 0.007
        }
        
        this.character.setScale(this.characterScale, this.characterScale)
        this.character.rotation += 0.06
    }
}