import Phaser, { Physics } from 'phaser'
import MovingSpikesController from './MovingSpikesController'
import ObstaclesController from './ObstaclesController'
import PlayerController from './PlayerController'
import ScorpionController from './ScorpionController'
// import CountdownController from './CountdownController'
import Slopes from 'phaser-slopes'
import PhysicsTimer from 'physics-timer'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private penguin?: Phaser.Physics.Matter.Sprite    // ? = could be undefined
    private playerController?: PlayerController
    private obstacles!: ObstaclesController
    private scorpions?: ScorpionController[] = [] //array of scorpion controllers since there can be more than 1
    private spikesMoveUp?: MovingSpikesController[] = []

    private map?: Phaser.Tilemaps.Tilemap
    private groundLayer?: Phaser.Tilemaps.TilemapLayer

    private physicsTimer: PhysicsTimer


    // /** @type {CountdownController} */
    // countdown

    constructor() {
        super('game')
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
        this.load.scenePlugin('Slopes', Slopes);
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.atlas('explorer', 'assets/explorer.png', 'assets/explorer.json')
        this.load.atlas('scorpion', 'assets/scorpion.png', 'assets/scorpion.json')
        this.load.image('tiles', 'assets/AllTilesLarge.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/Alexandria.json')
        this.load.image('star', 'assets/star.png')
        this.load.image('health', 'assets/health.png')
        this.load.image('piglet', 'assets/pigletCeasar.png')
        this.load.atlas('spikeMoveUp', 'assets/spikeMoveUp.png', 'assets/spikeMoveUp.json')
        this.load.audio('egyptmusic', ['/assets/audio/egyptmusic.mp3'])
    }

    create() {
        console.log("Launching Game!")
        this.scene.launch('ui') //runs parallel scenes (aka UI.. )

        //Physics Timer
        this.matter.world.autoUpdate = false;
        this.physicsTimer = new PhysicsTimer(() => this.matter.world.step())

        // Sets width and height to the scale
        const {width, height} = this.scale
        this.cameras.main.setBackgroundColor('rgb(193,147,107)')
        
        // adds tilemap
        this.map = this.make.tilemap({ key: 'tilemap' })
        const tileset = this.map.addTilesetImage('AllTilesLarge', 'tiles')

        this.groundLayer = this.map.createLayer('ground', tileset)   // creates the game layer
        this.map.createLayer('obstacles', tileset)
        this.groundLayer.setCollisionByProperty({ collides: true })   // sets collision property

        this.matter.world.convertTilemapLayer(this.groundLayer)   // add matter to tilemap aka blue lines in the server; makes tiles static
        
        const music = this.sound.add ('egyptmusic')
        if (this.sound.locked)
		{
			this.add.text(this.scale.width * 0.5, 50, 'Tap to Play').setOrigin(0.5)
			this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
				music.play()
			})
		}
		else
		{
			music.play()
		}

        // this.cameras.main.scrollY = 200  // moves camera down; starts at 0, 0 aka upper left corner
        this.cameras.main.setZoom(0.6,0.6)
        
        const objectLayer = this.map.getObjectLayer('objects')

        objectLayer.objects.forEach(objData => {
            const{ x = 0, y = 0, name, width = 0, height = 0 } = objData

            switch(name) {
                case 'penguin-spawn': {
                    // var playerConfig = 
                    this.penguin = this.matter.add.sprite(x + (width * 0.5), y, 'explorer', 'explorer_walk01.png', {friction: 0.45, chamfer: { radius: 20 } })  // add penguin to server
                        .play('player-idle')
                        // .setCircle((width/2)-10)
                        // .setFrictionStatic(4)
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
                        
                    this.spikesMoveUp.push(new MovingSpikesController(this, spikeMoveUp as Phaser.Physics.Matter.Sprite)) //add a scorpion controller for each scorpion in tiled
                    
                    this.obstacles.add('spikeMoveUp', spikeMoveUp.body as MatterJS.BodyType)
                    
                    break
                }

                case 'piglet':{
                    const piglet = this.matter.add.sprite(x, y, 'piglet', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    piglet.setData('type', 'piglet') // set the Data of the star so that when collieded, we know it's a star
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
        console.log("Destroying game")
        this.scene.stop('ui')
        this.scorpions.forEach(scorpion => scorpion.destroy())
    }


    update(t: number, dt: number) {
        // Physics Timer
        this.physicsTimer.update()  // you can pass dt to use Phaser's timer instead of the clock, but I find this is actually smoother

        this.playerController?.update(dt)

        // update scorpion controller every frame
        this.scorpions.forEach(scorpion => scorpion.update(dt))
        this.spikesMoveUp.forEach(spikeMoveUp => spikeMoveUp.update(dt))

    }
}