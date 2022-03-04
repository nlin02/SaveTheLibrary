import Phaser from 'phaser'

export default class Game extends Phaser.Scene {

    #penguin;
    #cursors;
    #isTouchingGround = false;

    constructor() {
        super('game')
    }

    init() {
        this.#cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.atlas('penguin', 'assets/penguin.png', 'assets/penguin.json')
        this.load.image('tiles', 'assets/sheet.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/game.json')
    }

    create() {
        // Sets width and height to the scale
        const {width, height} = this.scale
        // short for 
        // const width = this.scale.width
        // const height = this.scale.height

        // this.add.image(width * 0.5, height * 0.5, 'penguin', 'penguin_die04.png')

        this.#createPenguinAnimations()
        
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
                    this.#penguin = this.matter.add.sprite(x + (width * 0.5), y, 'penguin')  // add penguin to server
                        .play('player-idle')
                        .setFixedRotation()

                    // this.#penguin.setOnCollide( (data: MatterJS.ICollisionPair) => {
                    //     this.#isTouchingGround = true;
                    // })

                    this.cameras.main.startFollow(this.#penguin)  // centers camera on penguin

                    break
                }
            }
        })
    }

    update() {
        const speed = 5

        if (this.#cursors.left.isDown) {
            this.#penguin.flipX = true
            this.#penguin.setVelocityX(-speed)
            this.#penguin.play('player-walk', true)
        }
        else if (this.#cursors.right.isDown) {
            this.#penguin.flipX = false
            this.#penguin.setVelocityX(speed)
            this.#penguin.play('player-walk', true)
        }
        else {
            this.#penguin.setVelocityX(0)
            this.#penguin.play('player-idle', true)
        }

        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.#cursors.space)
        if (spaceJustPressed && this.#isTouchingGround) {
            this.#penguin.setVelocityY(-12)
            this.#isTouchingGround = false
        }
    }

    #createPenguinAnimations() {
        this.anims.create({
            key: 'player-idle',
            frames: [{
                key: 'penguin',
                frame: 'penguin_walk01.png'
            }]
        })

        this.anims.create({
            key: 'player-walk',
            frameRate: 10,
            frames: this.anims.generateFrameNames('penguin', {
                start: 1, 
                end: 4, 
                prefix: 'penguin_walk0',
                suffix: '.png'
            }),
            repeat: -1
        })
    }
}