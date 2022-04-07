import Phaser from 'phaser'
import MovingSpikesController from './MovingSpikesController'
import ObstaclesController from './ObstaclesController'
import PlayerController from './PlayerController'
import ScorpionController from './ScorpionController'
// import CountdownController from './CountdownController'

export default class Game2 extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private penguin?: Phaser.Physics.Matter.Sprite    // ? = could be undefined
    private playerController?: PlayerController
    private obstacles!: ObstaclesController
    private scorpions?: ScorpionController[] = [] //array of scorpion controllers since there can be more than 1
    private spikesMoveUp?: MovingSpikesController[] = []
    private groundLayer?: Phaser.Tilemaps.TilemapLayer


    private map?: Phaser.Tilemaps.Tilemap


    // /** @type {CountdownController} */
    // countdown

    constructor() {
        super('levelTwo')
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.obstacles = new ObstaclesController()
        this.scorpions = [] //create new list of scorpions every time game starts
        this.spikesMoveUp = []

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy()
        })
    }

    preload() {
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.atlas('explorer', 'assets/explorer.png', 'assets/explorer.json')
        this.load.atlas('scorpion', 'assets/scorpion.png', 'assets/scorpion.json')
        this.load.image('tiles', 'assets/AllTilesLarge.png')
        this.load.tilemapTiledJSON('level1', 'assets/DraftsTileMaps/Level1JSON.json')
        this.load.image('star', 'assets/star.png')
        this.load.image('health', 'assets/health.png')
        this.load.image('timemachine', 'assets/timemachine.png')
        this.load.atlas('spikeMoveUp', 'assets/spikeMoveUp.png', 'assets/spikeMoveUp.json')
        this.load.audio('egyptmusic', ['/assets/audio/egyptmusic.mp3'])
    }

    create() {
        console.log("Launching Game2!")
        this.scene.launch('ui') //runs parallel scenes (aka UI.. )

        // Sets width and height to the scale
        const {width, height} = this.scale
        this.cameras.main.setBackgroundColor('rgb(193,147,107)')

        // this.add.image(width * 0.5, height * 0.5, 'penguin', 'penguin_die04.png')
        
        // adds tilemap
        this.map = this.make.tilemap({ key: 'level1' })
        const tileset = this.map.addTilesetImage('AllTilesLarge', 'tiles')

        const ground = this.map.createLayer('ground', tileset)   // creates the game layer
        this.map.createLayer('obstacles', tileset)
        ground.setCollisionByProperty({ collides: true })   // sets collision property

        this.matter.world.convertTilemapLayer(ground)   // add matter to tilemap aka blue lines in the server; makes tiles static
    

        this.cameras.main.scrollY = 200  // moves camera down; starts at 0, 0 aka upper left corner
        this.cameras.main.setZoom(0.6,0.6)
        
        const objectLayer = this.map.getObjectLayer('objects')

        objectLayer.objects.forEach(objData => {
            const{ x = 0, y = 0, name, width = 0, height = 0 } = objData

            switch(name) {
                case 'penguin-spawn': {
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y, 'explorer')  // add penguin to server
                        .play('player-idle')
                        .setFixedRotation()

                    this.playerController = new PlayerController(this, this.penguin, this.cursors, this.obstacles, this.map, this.groundLayer)

                    this.cameras.main.startFollow(this.penguin, true)  // centers camera on penguin
                    break
                }

                    case 'scorpion': {
                    const scorpion = this.matter.add.sprite(x, y, 'scorpion')
                        .setFixedRotation()
                    this.scorpions.push(new ScorpionController(this, scorpion)) //add a scorpion controller for each scorpion in tiled
                    
                    // add scorpions to obstacles controller
                    this.obstacles.add('scorpion', scorpion.body as MatterJS.BodyType)
                    
                    break
                }


                case 'spikes-moveup': {
                    const spikeMoveUp = this.matter.add.sprite(x, y, 'spikeMoveUp')
                        .setFixedRotation()
                    
                    // spikeMoveUp.setStatic(true)
                    
                    // spikeMoveUp.setBody('STATIC_BODY')
                        
                    
                    // spikeMoveUp.setIgnoreGravity(true).disableInteractive()
                    // spikeMoveUp.setBody
                    
                    // spikeMoveUp.setOnCollideWith(this.penguin, () => {
                    //     spikeMoveUp.setX(x)
                    // })

                    // spikeMoveUp.setMass(10000)
                    
                    // spikeMoveUp.body.immovable = true;
                        
                    this.spikesMoveUp.push(new MovingSpikesController(this, spikeMoveUp as Phaser.Physics.Matter.Sprite)) //add a scorpion controller for each scorpion in tiled
                    
                    this.obstacles.add('spikeMoveUp', spikeMoveUp.body as MatterJS.BodyType)
                    
                    break
                }

                case 'time-machine':{
                    const timeMachine = this.matter.add.sprite(x,y, 'timemachine', undefined, {
                        isStatic: true,
                        isSensor: true
                    })

                    timeMachine.setData('type', 'time-machine')
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

    // when scene ends, clean up scorpion events
    destroy() {
        console.log("Destroying game2")
        this.scene.stop('ui')
        this.scorpions.forEach(scorpion => scorpion.destroy())
    }


    update(t: number, dt: number) {

        this.playerController?.update(dt)

        // update scorpion controller every frame
        this.scorpions.forEach(scorpion => scorpion.update(dt))
        this.spikesMoveUp.forEach(spikeMoveUp => spikeMoveUp.update(dt))

    }
}