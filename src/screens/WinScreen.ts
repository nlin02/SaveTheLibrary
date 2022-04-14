import Phaser from 'phaser'

export default class Win extends Phaser.Scene{
    constructor(){
        super('win')
    }

    create(){
        const{width, height} = this.scale
        this.add.text(width*0.5, height *0.3, 'Yay! You Win!! ', {
            fontSize: '52px',
            color: '#ff0000'
        })
        .setOrigin(0.5)

        const button = this.add.rectangle(width * 0.5, height *0.55, 150, 75,0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.scene.start('game')
            })

        this.add.text(button.x, button.y, 'Play Again',{
            color: '#000000'
        })
        .setOrigin(0.5)
    }
}