import Phaser from 'phaser'
import ObstaclesController from './ObstaclesController'
import PlayerController from './PlayerController'
import SnowmanController from './SnowmanController'
// import CountdownController from './CountdownController'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private penguin?: Phaser.Physics.Matter.Sprite    // ? = could be undefined
    private playerController?: PlayerController
    private obstacles!: ObstaclesController
    private snowmen?: SnowmanController[] = [] //array of snowman controllers since there can be more than 1


    // /** @type {CountdownController} */
    // countdown

    constructor() {
        super('game')
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.obstacles = new ObstaclesController()
        this.snowmen = [] //create new list of snowmen every time game starts

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy()
        })
    }

    preload() {
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.image('tiles', 'assets/sheet.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/game.json')
        this.load.image('star', 'assets/star.png')
        this.load.image('health', 'assets/health.png')
        this.load.atlas('snowman', 'assets/snowman.png', 'assets/snowman.json')
    }

    create() {
        this.scene.launch('ui') //runs parallel scenes (aka UI.. )

        // Sets width and height to the scale
        const {width, height} = this.scale

        // this.add.image(width * 0.5, height * 0.5, 'penguin', 'penguin_die04.png')
        
        // adds tilemap
        const map = this.make.tilemap({ key: 'tilemap' })
        const tileset = map.addTilesetImage('iceworld', 'tiles')

        const ground = map.createLayer('ground', tileset)   // creates the game layer
        map.createLayer('obstacles', tileset)
        ground.setCollisionByProperty({ collides: true })   // sets collision property

        this.matter.world.convertTilemapLayer(ground)   // add matter to tilemap aka blue lines in the server; makes tiles static
        
        // this.cameras.main.scrollY = 200  // moves camera down; starts at 0, 0 aka upper left corner
        
        const objectLayer = map.getObjectLayer('objects')

        objectLayer.objects.forEach(objData => {
            const{ x = 0, y = 0, name, width = 0, height = 0 } = objData

            switch(name) {
                case 'penguin-spawn': {
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y, 'penguin')  // add penguin to server
                        .play('player-idle')
                        .setFixedRotation()

                    this.playerController = new PlayerController(this, this.penguin, this.cursors, this.obstacles)

                    this.cameras.main.startFollow(this.penguin, true)  // centers camera on penguin
                    break
                }

                case 'snowman': {
                    const snowman = this.matter.add.sprite(x, y, 'snowman')
                        .setFixedRotation()
                    this.snowmen.push(new SnowmanController(this, snowman)) //add a snowman controller for each snowman in tiled
                    
                    // add snowmen to obstacles controller
                    this.obstacles.add('snowman', snowman.body as MatterJS.BodyType)
                    
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

                case 'health': {
                    const health = this.matter.add.sprite(x,y, 'health', undefined, {
                        isStatic: true,
                        isSensor: true
                    })

                    health.setData('type', 'health')
                    health.setData('healthPoints', 10)
                    break
                }

                case 'spikes': {
                    const spike = this.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                        isStatic: true
                    })
                    this.obstacles.add('spikes', spike)
                    break
                }

            }
        })
    }

    // when scene ends, clean up snowman events
    destroy() {
        this.scene.stop('ui')
        this.snowmen.forEach(snowman => snowman.destroy())
    }

    handleCountdownFinished(){
        // null player from moving 
    }

    update(t: number, dt: number) {

        this.playerController?.update(dt)

        // update snowman controller every frame
        this.snowmen.forEach(snowman => snowman.update(dt))

        // question mark after playerController does null check in Typescript
        // it is the same as saying
        // if (this.playerController){
        //     this.playerController.update(dt)
        // }
    }
}