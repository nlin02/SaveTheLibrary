import Phaser from 'phaser'

export default class TimeTravelScreen extends Phaser.Scene{

    private background: Phaser.GameObjects.Image
    private explorer: Phaser.GameObjects.Image
    private professor: Phaser.GameObjects.Image

    private screenTime: number
    private characterScale: number

    private hasProfessor : boolean
    private nextScene : string
    private sceneKey: string
    private previousSound : string

    constructor(sceneKey: string, hasProfessor : boolean, nextScene : string, previousSound: string) {
        super(sceneKey)
        this.sceneKey = sceneKey
        this.hasProfessor = hasProfessor
        this.nextScene = nextScene
        this.previousSound = previousSound
    }

    preload () {
        this.load.image('background', 'assets/screenBackgrounds/travelBackground.png');
        this.load.image('explorer', 'assets/explorer/explorertravel.png');
        this.load.image('professor', 'assets/professor/professor_faint.png');

        this.load.audio('timetravel', 'assets/audio/timetravel.mp3')

        
    }

    create() {
        this.sound.removeByKey(this.previousSound)
        this.sound.play('timetravel')

        this.screenTime = 15;
        this.characterScale = 1 
        
        const{width, height} = this.scale

        this.background = this.add.image(400,300, "background")
        this.background.setScale(.5,.5)
            .setRotation

        this.explorer = this.add.image(400,300, 'explorer')
        this.explorer.setScale(this.characterScale,this.characterScale)
            .setRotation

        if (this.hasProfessor) {
            this.professor = this.add.image(300,200, 'professor')
            this.professor.setScale(this.characterScale,this.characterScale)
                .setRotation
        }
    }

    update() {
        this.screenTime -= 0.1
        if( this.screenTime > 0) {
            this.background.rotation += 0.03
            this.updateCharacter()
        }
        else{
            this.scene.start(this.nextScene)
        }
    }

    private updateCharacter() {
        if( this.characterScale > 0) {
            this.characterScale -= 0.007
        }
        if (this.hasProfessor){
            this.professor.setScale(this.characterScale, this.characterScale)
            this.professor.rotation += 0.06
        }
        
        this.explorer.setScale(this.characterScale, this.characterScale)
        this.explorer.rotation += 0.06
    }
}