import Phaser from 'phaser'
import WebFontFile from '../WebFontFile';


export default class TitleScene extends Phaser.Scene{
    constructor(){
        super('title-scene')
    }
    
    preload() {
        this.load.addFile(new WebFontFile(this.load, [
            'Redressed',
            'Livvic',
            'Roboto'
        ]))
        this.load.image('homeBackground', 'assets/screenBackgrounds/HomeBackground.png')

    }

    create(){

        const{width, height} = this.scale

        const background = this.add.image(0,0,"homeBackground")
        background.setScale(1.1,1.1)
        background.setOrigin(0,0)

        const text = this.add.text(width*0.5, height *0.4, 'SAVE THE \nLIBRARY', {
            fontSize: '80px',
            color: '#3a1b13'
        })
        .setOrigin(0.5)
        .setFontFamily("Redressed")
        .setShadow(3,4,"#C2B280", 4)
        
        
        const button = this.add.rectangle(width * 0.5, height *0.7, 150, 75,0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('email-screen')  
            })

        this.add.text(button.x, button.y, 'Start Game',{
            color: '#918151'
        })
        .setOrigin(0.5)
        .setFontFamily("Livvic")
    }
}