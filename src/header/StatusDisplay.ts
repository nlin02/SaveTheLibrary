import Phaser from 'phaser'
import { sharedInstance as events } from '../eventcenter/EventCenter'
import PlayerController from '../controllers/PlayerController'

export default class StatusDisplay extends Phaser.Scene
{
    private timePos !: Phaser.GameObjects.Rectangle // represents positive time
    private timeNeg !: Phaser.GameObjects.Rectangle // represents negative time
    
    private initialTime: number

    private timeBarX = 170
    private timeBarY = 50
    private timeBarHeight = 25
    private timeBarLength = 180

    private clock : Phaser.GameObjects.Image
    private redDeath : Phaser.GameObjects.Image

    constructor()
    {
        super({//the key of our scene; it will be playing simultaneously as Game scene
            key: 'status-display'
        })
    }


    create()
    {
        this.clock = this.add.image(this.timeBarX - 0.65 * this.timeBarLength, this.timeBarY, 'clock')
            .setDisplaySize(this.timeBarHeight + 10, this.timeBarHeight + 10)

        this.setUpTime()
        this.createDeathOverlay()

        // events.on('star-collected', this.handleStarCollected, this)
        events.on('timerIncrement', this.updateTimeBar, this)
        events.on('startedTime', this.setStartTime, this)

        // // clean up of resources that we know we need for later.. 
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            events.off('timerIncrement', this.updateTimeBar, this)
            events.off('startedTime', this.setStartTime, this)
        })
    }
    

    createDeathOverlay() {        
        this.redDeath = this.add.image(405,305,'redDeathEdges')
        this.redDeath.setDisplaySize(850,650)
        this.redDeath.setVisible(false)

        this.tweens.add({
            targets: this.redDeath,
            alpha: 0.25,
            yoyo: true,
            repeat: -1,
            speed: 500, 
            ease: 'Sine.easeInOut'
        });
    }


    private setStartTime(initialTime:number) {
        this.initialTime = initialTime
    }

    private setUpTime(){
        this.timeNeg = this.add.rectangle(this.timeBarX, this.timeBarY, this.timeBarLength, this.timeBarHeight, 0x808080)
        this.timePos = this.add.rectangle(this.timeBarX, this.timeBarY, this.timeBarLength, this.timeBarHeight, 0x2c58aa)
        this.clock.setTint(0x2c58aa)
    }

    private updateTimeBar(currentTime: number){ 
        const lengthPerTime = this.timeBarLength / this.initialTime
        this.timePos.setSize(Math.ceil(lengthPerTime * currentTime), this.timeBarHeight)
        this.timePos.setPosition(this.timeBarX - .1/2, this.timeBarY)

        if (currentTime < 0.5 * this.initialTime && currentTime > 0.25 * this.initialTime) {
            this.timePos.fillColor = 0x614d79
            this.clock.setTint(0x614d79)
        }
        else if(currentTime < 0.25 * this.initialTime) {
            this.timePos.fillColor = 0xc22626
            this.cameras.main.shake(500,0.005)
            this.clock.setTint(0xc22626)
            this.redDeath.setVisible(true)
        }

    }

}