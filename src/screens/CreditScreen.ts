import Phaser from 'phaser'
import WebFontFile from '../WebFontFile';

export default class CreditScreen extends Phaser.Scene {
    constructor() {
        super('credit')
    }

    private screenTime = 15
    private background: Phaser.GameObjects.Image
    private button : Phaser.GameObjects.Rectangle
    private text : Phaser.GameObjects.Text

    preload() {
        this.load.addFile(new WebFontFile(this.load, [
            'Redressed',
            'Livvic',
            'Roboto'
        ]))
        this.load.image('creditBackground', 'assets/screenBackgrounds/creditBackground.png')
        this.load.audio('winmusic', 'assets/audio/winmusic.mp3')
    }

    create() {

        this.cameras.main.fadeIn(1000, 0, 0, 0)
        const{width, height} = this.scale

        this.background = this.add.image(12,5,"creditBackground")
        this.background.setScale(.8,.8)
            .setOrigin(0,0)

                        
        this.button = this.add.rectangle(width * 0.501, height *0.92, 250, 55,0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('title-scene')
            })

        this.text = this.add.text(this.button.x, this.button.y, 'Return To Home',{
                color: '#918151',
                fontSize: 'x-large'
            })
            .setOrigin(0.5)
            .setFontFamily("Livvic")

        this.button.visible = false
        this.text.visible = false
        
        
    }

    update() {
        if (this.background.y > -1410) {
            this.background.setY(this.background.y - 1)
        }
        else{
            this.screenTime -= .01
            if (this.screenTime < 10) {
                this.button.visible = true
                this.text.visible = true
            }
        }
    }
}