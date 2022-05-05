import Phaser from 'phaser'
import WebFontFile from '../WebFontFile';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('win')
    }
    
    preload() {
        this.load.addFile(new WebFontFile(this.load, [
            'Redressed',
            'Livvic',
            'Roboto'
        ]))
        this.load.image('winBackground', 'assets/screenBackgrounds/winBackground.png')
    }

    create() {
        this.sound.removeByKey('egyptmusic')
        this.sound.play('winmusic')

        this.cameras.main.fadeIn(1000, 0, 0, 0)
        const{width, height} = this.scale

        const background = this.add.image(-25,0,"winBackground")
        background.setScale(1.05,1.05)
            .setOrigin(0,0)

        const text = this.add.text(width*0.5, height *0.15, 'MISSION SUCCESS!', {
            fontSize: '70px',
            color: '#3a1b13'
        })
            .setOrigin(0.5)
            .setFontFamily("Redressed")
            .setShadow(3,4,"#C2B280", 4)
        
        const button = this.add.rectangle(width * 0.8, height *0.85, 150, 75,0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('LevelHouse')
            })

        this.add.text(button.x, button.y, 'Play Again',{
            color: '#918151',
            fontSize: 'x-large'
        })
            .setOrigin(0.5)
            .setFontFamily("Livvic")
    }
}