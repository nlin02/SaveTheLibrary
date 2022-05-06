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
    private explorer?: Phaser.Physics.Matter.Sprite   
    private playerController?: PlayerController
    private obstacles!: ObstaclesController
    private scorpions?: ScorpionController[] = [] //array of scorpion controllers since there can be more than 1
    private spikesMoveUp?: MovingSpikesController[] = []

    private blueParticles
    private blueEmitter

    private map?: Phaser.Tilemaps.Tilemap
    private groundLayer?: Phaser.Tilemaps.TilemapLayer

    private physicsTimer: PhysicsTimer

    private tilemapKey: string
    private tilemapJSONLocation: string
    private levelTime: number
    private musicKey:string
    
    private backgroundImageKey:string
    private midgroundImageKey: string
    private foregroundImageKey: string

    constructor(tilemapKey: string, tilemapJSONLocation: string, levelTime: number, musicKey: string,
        foregroundImageKey?:string, midgroundImageKey?:string, backgroundImageKey?:string) {

        super(tilemapKey)

        this.tilemapKey = tilemapKey
        this.tilemapJSONLocation = tilemapJSONLocation
        this.levelTime = levelTime
        this.musicKey = musicKey
        this.foregroundImageKey = foregroundImageKey
        this.midgroundImageKey = midgroundImageKey
        this.backgroundImageKey = backgroundImageKey
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
        this.load.atlas('scorpion', 'assets/scorpion/scorpion.png', 'assets/scorpion/scorpion.json')
        this.load.atlas('spikesMoveUp', 'assets/spikes/spikesMoveUp.png', 'assets/spikes/spikesMoveUp.json')
        this.load.atlas('fire', 'assets/fire/fire.png', 'assets/fire/fire.json')

        this.load.image('tiles', 'assets/tilemaps/AllTilesLarge.png')
        this.load.image('tiles2', 'assets/tilemaps/TombTiles.png')
        this.load.image('tiles3', 'assets/tilemaps/DarkTiles.png')
        this.load.tilemapTiledJSON(this.tilemapKey, this.tilemapJSONLocation)
        
        this.load.image('star', 'assets/star.png')
        this.load.image('health', 'assets/health.png')
        this.load.image('yellow', 'assets/particles/yellow.png');
        this.load.image('blue', 'assets/particles/blue.png');
        this.load.image('smoke', 'assets/particles/smoke.png');
        this.load.image('red', 'assets/particles/red.png');

        this.load.image('moveInstr', 'assets/instructions/moveInstruction.png')
        this.load.image('climbInstr', 'assets/instructions/climbInstruction.png')
        this.load.image('jumpInstr', 'assets/instructions/jumpInstruction.png')
        this.load.image('exclam1', 'assets/instructions/exclam_01.png')
        this.load.image('exclam2', 'assets/instructions/exclam_02.png')
        this.load.image('exclam3', 'assets/instructions/exclam_03.png')
        this.load.image('exclam4', 'assets/instructions/exclam_04.png')

        //all sound effects are used in PlayerController
        this.load.audio('egyptmusic', 'assets/audio/egyptmusic.mp3')
        this.load.audio('tombmusic', 'assets/audio/tombmusic.mp3')
        this.load.audio('housemusic', 'assets/audio/housemusic.mp3')
        this.load.audio('winmusic', 'assets/audio/winmusic.mp3')
        this.load.audio('powerup', 'assets/audio/powerup.mp3')
        this.load.audio('objecthit', 'assets/audio/objecthit.mp3')
        this.load.audio('scorpionstomp', 'assets/audio/scorpionstomp.mp3')
        this.load.audio('scorpionhit', 'assets/audio/scorpionhit.mp3')
        this.load.audio('levelchange', 'assets/audio/levelchange.mp3')
        this.load.audio('timetravel', 'assets/audio/timetravel.mp3')
        this.load.audio('gamecompleted', 'assets/audio/gamecompleted.mp3')
        this.load.audio('swim', 'assets/audio/swim.mp3')

        this.load.image('clock', 'assets/greyClock.png')
        this.load.image('professor', 'assets/professor/professor_faint.png')
        this.load.image('timeMachine', 'assets/timemachine.png')
        this.load.image('door', 'assets/ExitDoor.png')
        this.load.image('redDeathEdges', 'assets/redEdges70.png')

        // Background
        this.load.image('sky', 'assets/background/BlueBackground.png')
        this.load.image('clouds', 'assets/background/Clouds.png')
        this.load.image('houses', 'assets/background/HouseShadow.png')
        this.load.image('orangeblue', 'assets/background/OrangeGradBackground.png')
        this.load.image('pyramids', 'assets/background/PyramidShadow.png')
        this.load.image('sphinx', 'assets/background/Sphinx.png')
    }

    create() {
        this.scene.launch('status-display') //runs parallel scenes (aka UI.. )

        this.setUpTileMap()

        if (this.musicKey == 'egyptmusic'){
            this.sound.removeByKey('tombmusic')
        }
        const music = this.sound.add(this.musicKey)
        this.createMusic(music)

        events.on('changeScene', this.changeScene, this)      
    }

    destroy() {
        this.scene.stop('status-display')
        this.scorpions.forEach(scorpion => scorpion.destroy()) // when scene ends, clean up scorpion events
    }

    update(t: number, dt: number) {
        this.physicsTimer.update()
    }

    // physics, playerController timer, scorpions and spikes are updated consistently by the physicsTimer
    private fixedIntervalUpdate(dt:number) {
        this.matter.world.step()
        this.playerController?.update(dt)
        this.scorpions.forEach(scorpion => scorpion.update(dt))
        this.spikesMoveUp.forEach(spikeMoveUp => spikeMoveUp.update(dt))
    }

    private changeScene(nextScene: Phaser.Scene) {
        this.scene.start(nextScene)
    }

    private setUpTileMap() {
        this.matter.world.autoUpdate = false;
        this.physicsTimer = new PhysicsTimer(() => {
            this.fixedIntervalUpdate(1000/60)
        })

        const {width, height} = this.scale

        // Add scene switch animations (Fade In)
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        
        // adds tilemap
        this.map = this.make.tilemap({ key: this.tilemapKey })
        const tileset = this.map.addTilesetImage('AllTilesLarge', 'tiles')
        const tombTileSet = this.map.addTilesetImage('TombTiles', 'tiles2')
        const darkTileSet = this.map.addTilesetImage('DarkTiles', 'tiles3')

        // Background
        this.createBackground()

        this.map.createLayer('background', [tileset, tombTileSet, darkTileSet])
        this.groundLayer = this.map.createLayer('ground', [tileset, tombTileSet, darkTileSet])   // creates the game layer
        this.groundLayer.setCollisionByProperty({ collides: true })   // sets collision property
        this.map.createLayer('obstacles', [tileset, tombTileSet, darkTileSet])
        
        this.matter.world.convertTilemapLayer(this.groundLayer)   // add matter to tilemap aka blue lines in the server; makes tiles static
        
        this.cameras.main.setZoom(0.6,0.6)

        const objectLayer = this.map.getObjectLayer('objects')
        this.createObjects(objectLayer)
    }

    private createBackground() {
        const {width, height} = this.scale
        const totalWidth = this.map.widthInPixels + 2000

        if (this.backgroundImageKey) {
            this.add.image(width * 0.5, height * 0.5, this.backgroundImageKey)
		    .setScrollFactor(0)
        }

        if(this.midgroundImageKey) {
            createParallax(this, width * 0.5, totalWidth, this.midgroundImageKey, 0.25)
        } 
        if (this.foregroundImageKey) {
            createParallax(this, width * 0.5, totalWidth, this.foregroundImageKey, 0.5)  
        }
    }

    private createObjects(layer: Phaser.Tilemaps.ObjectLayer) {
        this.createBlueEmitter()
        layer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0, height = 0 } = objData

            switch(name) {
                case 'spawn': {
                    var yellowParticles = this.add.particles('yellow');
                    this.explorer = this.matter.add.sprite(x + (width * 0.5), y, 'explorer', 'explorer_walk01.png', {friction: 0.45, chamfer: { radius: 20 } })  // add explorer to server
                        .play('player-idle')
                        .setFixedRotation()
                    this.playerController = new PlayerController(this, this.explorer, this.cursors, this.obstacles, this.map, this.groundLayer, this.levelTime, yellowParticles)
                    this.cameras.main.startFollow(this.explorer, true) 
                    break
                }

                case 'move-instr': {
                    const moveInstruction = this.add.image(x, y, 'moveInstr', undefined)
                    break
                }

                case 'jump-instr': {
                    const jumpInstruction = this.add.image(x, y, 'jumpInstr', undefined)
                    break
                }

                case 'climb-instr': {
                    const climbInstruction = this.add.image(x, y, 'climbInstr', undefined)
                    break
                }

                case 'exclam1': {
                    const img = this.add.image(x, y, 'exclam1', undefined)
                    img.setScale(.5,.5)
                    break
                }
                case 'exclam2': {
                    const img = this.add.image(x, y, 'exclam2', undefined)
                    img.setScale(.5,.5)
                    break
                }
                case 'exclam3': {
                    const img = this.add.image(x, y, 'exclam3', undefined)
                    img.setScale(.5,.5)
                    break
                }
                case 'exclam4': {
                    const img = this.add.image(x, y, 'exclam4', undefined)
                    img.setScale(.5,.5)
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

                case 'fire': {
                    const fire = this.matter.add.sprite(x, y, 'fire')
                        .setFixedRotation()                    
                    this.obstacles.add('fire', fire.body as MatterJS.BodyType)
                    this.animateFire(fire)
                    break
                }

                case 'professor': {
                    const sprite = this.matter.add.sprite(x, y, 'professor', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    for (var property of objData.properties) {
                        sprite.setData(property.name, property.value)
                    }
                    sprite.setData('type', 'Professor')
                    break
                }

                case 'entrance': {
                    const sprite = this.matter.add.sprite(x, y, 'door', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    sprite.setData('type', 'enter-door')
                    break
                }

                case 'time-machine': {
                    const machine = this.matter.add.sprite(x, y, 'timeMachine', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    for (var property of objData.properties) {
                        machine.setData(property.name, property.value)
                    }
                    machine.setData('type', 'time-machine')
                    this.blueEmitter.startFollow(machine);
                    break
                }

                case 'star': {
                    const star = this.matter.add.sprite(x, y, 'star', undefined,{
                        isStatic: true,
                        isSensor: true
                    })
                    star.setData('type', 'star')
                    break
                }

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
                    door.setData('type', 'exit-door')
                    this.blueEmitter.startFollow(door);
                    break
                }
            }
        })
    }

    private createBlueEmitter() {
        this.blueParticles = this.add.particles('blue');
        this.blueEmitter = this.blueParticles.createEmitter({
            x: 100,
            y: 100, 
            speed: 100,
            scale: { start: 0.7, end: 0, ease: 'Quad.easeOut'},
            blendMode: 'HARD_LIGHT',
            lifespan: 4000,
            alpha: 0.8,
        });
    }

    private animateFire(fire: Physics.Matter.Sprite) {
        fire.anims.create({
            key: 'flicker-fire',
            frameRate: 10,
            frames: fire.anims.generateFrameNames('fire', {
                start: 1, 
                end: 4, 
                prefix: 'fire_0',
                suffix: '.png'
            }),
            repeat: -1
        })

        fire.play('flicker-fire')
        fire.setStatic(true)
    }

    private createMusic(song: Phaser.Sound.BaseSound) {
        if (this.sound.locked){
			this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
				song.play()
			})
		}
		else{
			song.play()
		}
    }
}

/**
     * Used for parallex scrolling to repeat background images
     * @param {Phaser.Scene} scene 
     * @param {number} totalWidth 
     * @param {string} texture 
     * @param {number} scrollFactor 
     */
 const createParallax = (scene, width, totalWidth, texture, scrollFactor) => {
    const w = scene.textures.get(texture).getSourceImage().width
    const count = Math.ceil(totalWidth / w) * scrollFactor

    let x = width * 0.5 - 500
    for (let i = 0; i < count; ++i) {
        const m = scene.add.image(x, scene.scale.height + 250, texture)
            .setOrigin(0, 1)
            .setScrollFactor(scrollFactor, 0)

            x += m.width
    }
}