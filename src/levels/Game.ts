import Phaser, { Physics } from 'phaser'
import MovingSpikesController from '../controllers/MovingSpikesController'
import ObstaclesController from '../controllers/ObstaclesController'
import PlayerController from '../controllers/PlayerController'
import ScorpionController from '../controllers/ScorpionController'
import Slopes from 'phaser-slopes'
import PhysicsTimer from 'physics-timer'
import { sharedInstance as events } from '../eventcenter/EventCenter'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private explorer?: Phaser.Physics.Matter.Sprite    // ? = could be undefined
    private playerController?: PlayerController
    private obstacles!: ObstaclesController
    private scorpions?: ScorpionController[] = [] //array of scorpion controllers since there can be more than 1
    private spikesMoveUp?: MovingSpikesController[] = []

    private map?: Phaser.Tilemaps.Tilemap
    private groundLayer?: Phaser.Tilemaps.TilemapLayer

    private physicsTimer: PhysicsTimer

    private tilemapKey: string
    private tilemapJSONLocation: string
    private levelTime: number


    // constructor takes layermap name
    constructor(tilemapKey: string, tilemapJSONLocation: string, levelTime: number) {
        super(tilemapKey)
        this.tilemapKey = tilemapKey
        this.tilemapJSONLocation = tilemapJSONLocation
        this.levelTime = levelTime
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
        
        this.load.atlas('explorer', 'assets/explorer/explorer.png', 'assets/explorer/explorer.json')
        this.load.atlas('scorpion', 'assets/scorpion.png', 'assets/scorpion.json')
        this.load.atlas('spikesMoveUp', 'assets/spikesMoveUp.png', 'assets/spikesMoveUp.json')

        this.load.image('tiles', 'assets/tilemaps/AllTilesLarge.png')
        this.load.image('tiles2', 'assets/tilemaps/TombTiles.png')
        this.load.image('tiles3', 'assets/tilemaps/DarkTiles.png')
        this.load.tilemapTiledJSON(this.tilemapKey, this.tilemapJSONLocation)
        this.load.image('star', 'assets/star.png')
        this.load.image('health', 'assets/health.png')

        this.load.audio('egyptmusic', ['/assets/audio/egyptmusic.mp3'])

        this.load.image('clock', 'assets/greyClock.png')
        this.load.image('Julius', 'assets/Julius.png')
        this.load.image('timeMachine', 'assets/timemachine.png')
        this.load.image('door', 'assets/pigletCeasar.png')
    }

    create() {
        console.log("Launching " + this.tilemapKey)
        this.scene.launch('status-display') //runs parallel scenes (aka UI.. )
        this.setUpTileMap()

        events.on('changeScene', this.changeScene, this)
    }

    // when scene ends, clean up scorpion events
    destroy() {
        console.log("Destroying game")
        this.scene.stop('status-display')
        this.scorpions.forEach(scorpion => scorpion.destroy())
    }


    update(t: number, dt: number) {
        // Physics Timer
        this.physicsTimer.update()  // you can pass dt to use Phaser's timer instead of the clock, but I find this is actually smoother

        this.playerController?.update(dt)
        this.scorpions.forEach(scorpion => scorpion.update(dt))
        this.spikesMoveUp.forEach(spikeMoveUp => spikeMoveUp.update(dt))
        
        // TODO: Delete later !! 
        // const keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
        // if (Phaser.Input.Keyboard.JustDown(keyH)) {
        //     this.scene.start('LevelAlexandria')
        // }

    }

    changeScene(nextScene: Phaser.Scene) {
        // Scene Transition (Fade Out)
        console.log("Fade Out", this.cameras)

        this.cameras.main.fadeOut(5000, 0, 100, 100)

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.time.delayedCall(1000, () => {
                this.scene.start(nextScene)
            })
        })
    }

    setUpTileMap(){

        this.matter.world.autoUpdate = false;
        this.physicsTimer = new PhysicsTimer(() => this.matter.world.step())

        // Sets width and height to the scale
        const {width, height} = this.scale
        this.cameras.main.setBackgroundColor('rgb(193,147,107)')

        // Add scene switch animations (Fade In)
        console.log("Fade In", this.cameras)
        this.cameras.main.fadeIn(1000, 100, 100, 0)
        
        // adds tilemap
        this.map = this.make.tilemap({ key: this.tilemapKey })
        const tileset = this.map.addTilesetImage('AllTilesLarge', 'tiles')
        const tombTileSet = this.map.addTilesetImage('TombTiles', 'tiles2')
        const darkTileSet = this.map.addTilesetImage('DarkTiles', 'tiles3')
        
        this.map.createLayer('background', [tileset, tombTileSet, darkTileSet])
        this.groundLayer = this.map.createLayer('ground', [tileset, tombTileSet, darkTileSet])   // creates the game layer
        this.groundLayer.setCollisionByProperty({ collides: true })   // sets collision property
        this.map.createLayer('obstacles', [tileset, tombTileSet, darkTileSet])
        

        this.matter.world.convertTilemapLayer(this.groundLayer)   // add matter to tilemap aka blue lines in the server; makes tiles static
        
        const music = this.sound.add ('egyptmusic')
        // this.createMusic(music)

        this.cameras.main.setZoom(0.6,0.6)

        const objectLayer = this.map.getObjectLayer('objects')
        this.createObjects(objectLayer)

    }

    createObjects(layer: Phaser.Tilemaps.ObjectLayer){

        layer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0, height = 0 } = objData

            switch(name) {
                case 'spawn': {
                    this.explorer = this.matter.add.sprite(x + (width * 0.5), y, 'explorer', 'explorer_walk01.png', {friction: 0.45, chamfer: { radius: 20 } })  // add explorer to server
                        .play('player-idle')
                        .setFixedRotation()
                    this.playerController = new PlayerController(this, this.explorer, this.cursors, this.obstacles, this.map, this.groundLayer, this.levelTime)
                    this.cameras.main.startFollow(this.explorer, true) 
                    break
                }

                case 'scorpion': {
                    const scorpion = this.matter.add.sprite(x, y, 'scorpion')
                        .setFixedRotation()
                    this.scorpions.push(new ScorpionController(this, scorpion)) //add a scorpion controller for each scorpion in tiled
                    
                    this.obstacles.add('scorpion', scorpion.body as MatterJS.BodyType)
                    
                    break
                }


                case 'spikes-moveup': {
                    const spikeMoveUp = this.matter.add.sprite(x, y, 'spikesMoveUp')
                        .setFixedRotation()
                        
                    this.spikesMoveUp.push(new MovingSpikesController(this, spikeMoveUp as Phaser.Physics.Matter.Sprite)) //add a scorpion controller for each scorpion in tiled
                    
                    this.obstacles.add('spikeMoveUp', spikeMoveUp.body as MatterJS.BodyType)
                    
                    break
                }

                case 'julius':{
                    const juliusSprite = this.matter.add.sprite(x, y, 'Julius', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    for (var property of objData.properties) {
                        juliusSprite.setData(property.name, property.value)
                    }
                    juliusSprite.setData('type', 'Julius') // set the Data of the star so that when collieded, we know it's a star
                    break
                }

                case 'time-machine':{
                    const machine = this.matter.add.sprite(x, y, 'timeMachine', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    for (var property of objData.properties) {
                        machine.setData(property.name, property.value)
                    }
                    // machine.setData('targetScene', 'LevelDungeon')
                    machine.setData('type', 'time-machine') // set the Data of the star so that when collieded, we know it's a star
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

                // case 'health': {
                //     const health = this.matter.add.sprite(x,y, 'health', undefined, {
                //         isStatic: true,
                //         isSensor: true
                //     })

                //     health.setData('type', 'health')
                //     health.setData('healthPoints', 10)
                //     break
                // }

                case 'spikes': {
                    const spike = this.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                        isStatic: true
                    })
                    this.obstacles.add('spikes', spike)
                    break
                }

                case 'exitdoor': {
                    const door = this.matter.add.sprite(x, y, 'door', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    for (var property of objData.properties) {
                        door.setData(property.name, property.value)
                    }
                    door.setData('type', 'exit-door') // set the Data of the star so that when collieded, we know it's a star
                    break
                    
                }

            }
        })
    }

    deleteObjects(layer: Phaser.Tilemaps.ObjectLayer){
        layer.objects.forEach(objData => {
            const{ x = 0, y = 0, name, width = 0, height = 0 } = objData
        })
    }

    createMusic(song: Phaser.Sound.BaseSound){
        if (this.sound.locked){
			this.add.text(this.scale.width * 0.5, 50, 'Tap to Play').setOrigin(0.5)
			this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
				song.play()
			})
		}
		else{
			song.play()
		}
    }
}