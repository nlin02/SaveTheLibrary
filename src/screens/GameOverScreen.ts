import Phaser from 'phaser'
import WebFontFile from '../WebFontFile'

export default class GameOver extends Phaser.Scene{
    constructor(){
        super('game-over')
    }

    preload() {
        this.load.addFile(new WebFontFile(this.load, [
            'Redressed',
            'Livvic',
            'Roboto'
        ]))
        this.load.image('deathBackground', 'assets/screenBackgrounds/GameOverBackground.png')

    }

    create(){
        this.sound.removeAll

        const background = this.add.image(0,0,"deathBackground")
        background.setScale(1.1,1.1)
        background.setOrigin(0,0)

        const{width, height} = this.scale
        this.add.text(width*0.5, height *0.4, 'MISSION\n FAILED.', {
            fontSize: '80px',
            color: '#000000'
        })
        .setOrigin(0.5)
        .setFontFamily("Redressed")
        .setShadow(3,4,"#882a2a", 4)

        const button = this.add.rectangle(width * 0.5, height *0.65, 150, 75,0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('LevelHouse')
            })

        this.add.text(button.x, button.y, 'Play Again',{
            color: '#000000'
        })
        .setOrigin(0.5)
        .setFontFamily("Livvic")
    }
}