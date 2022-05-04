import Phaser from 'phaser'

export default class EmailScreen extends Phaser.Scene{
    constructor(){
        super('email-screen')
    }

    preload ()
    {
        this.load.image('email', 'assets/email.png');
    }

    create(){
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        const{width, height} = this.scale

        const background = this.add.image(0,0,'email')
        background.setOrigin(0,0) 
        
        const button = this.add.rectangle(width * 0.8, height *0.9, 150, 75,0xccffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('LevelHouse')
            })

        this.add.text(button.x, button.y, 'Start Game',{
            color: '#7A76A6'
        })
        .setOrigin(.5)
        .setFontFamily("Livvic")
    }
}