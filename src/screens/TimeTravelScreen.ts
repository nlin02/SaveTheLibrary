import Phaser from 'phaser'


export default class TimeTravelScreen extends Phaser.Scene{

    private group : Phaser.GameObjects.Group

    constructor()
    {
        super('travel')
    }

    preload ()
    {
        this.load.image('bar', 'assets/timetravel.png');
    }

    create(){

        this.group = this.add.group({ key: 'bar', frameQuantity: 32, setXY: { x: 400, y: 300 }, setScale: { x: 2, y: 6 } });
    }
   
    update()
    {
        Phaser.Actions.Rotate(this.group.getChildren(), 0.005, 0.0005);
    }

}