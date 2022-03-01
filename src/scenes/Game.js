import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
    constructor() {
        super('game')
    }

    preload() {
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.image('tiles', 'assets/sheet.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/game.json')
    }

    create() {
        // const {width, height} = this.scale
        // short for 
        // const width = this.scale.width
        // const height = this.scale.height

        // this.add.image(width * 0.5, height * 0.5, 'penguin', 'penguin_die04.png')
        
        const map = this.make.tilemap({key: 'tilemap'})
        const tileset = map.addTilesetImage('iceworld', 'tiles')

        map.createLayer('ground', tileset)

        this.cameras.main.scrollY = 300

    }
}