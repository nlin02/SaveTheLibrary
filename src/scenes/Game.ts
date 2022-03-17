import Phaser from 'phaser'
import PlayerController from './PlayerController'
// import CountdownController from './CountdownController'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

    private penguin?: Phaser.Physics.Matter.Sprite    // ? = could be undefined

    private playerController?: PlayerController


    // /** @type {CountdownController} */
    // countdown

    constructor() {
        super('game')
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.image('tiles', 'assets/sheet.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/game.json')
        this.load.image('star', 'assets/star.png')
    }

    create() {
        this.scene.launch('ui') //runs parallel scenes (aka UI.. )
        // countdown //
        // const timerLabel = this.add.text(100,50,'45', {fontSize: 48})
        //     .setOrigin(0.5)
        // this.countdown = new CountdownController(this, timerLabel)
        // this.countdown.start(this.handleCountdownFinished.bind(this))
        
        // Sets width and height to the scale
        const {width, height} = this.scale
        // short for 
        // const width = this.scale.width
        // const height = this.scale.height

        // this.add.image(width * 0.5, height * 0.5, 'penguin', 'penguin_die04.png')
        
        // adds tilemap
        const map = this.make.tilemap({ key: 'tilemap' })
        const tileset = map.addTilesetImage('iceworld', 'tiles')

        const ground = map.createLayer('ground', tileset)   // creates the game layer
        ground.setCollisionByProperty({ collides: true })   // sets collision property

        this.matter.world.convertTilemapLayer(ground)   // add matter to tilemap aka blue lines in the server; makes tiles static
        
        // this.cameras.main.scrollY = 200  // moves camera down; starts at 0, 0 aka upper left corner
        
        const objectLayer = map.getObjectLayer('objects')

        objectLayer.objects.forEach(objData => {
            const{ x = 0, y = 0, name, width = 0 } = objData

            switch(name) {
                case 'penguin-spawn': {
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y, 'penguin')  // add penguin to server
                        .play('player-idle')
                        .setFixedRotation()

                    this.playerController = new PlayerController(this.penguin, this.cursors)

                    this.cameras.main.startFollow(this.penguin)  // centers camera on penguin
                    break
                }

                case 'star':{
                    const star = this.matter.add.sprite(x, y, 'star', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    star.setData('type', 'star') // set the Data of the star so that when collieded, we know it's a star
                    break
                }

            }
        })
    }

    handleCountdownFinished(){
        // null player from moving 
    }

    update(t: number, dt: number) {
        if (!this.playerController){
            return
        }

        this.playerController.update(dt)
    }
}