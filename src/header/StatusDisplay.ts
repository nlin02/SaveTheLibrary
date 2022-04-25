import { autorun } from 'mobx'
import Phaser from 'phaser'
import { sharedInstance as events } from '../eventcenter/EventCenter'
import PlayerController from '../controllers/PlayerController'

export default class StatusDisplay extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text //!: tells us it won't be null
    private starsCollected = 0
    private graphics!: Phaser.GameObjects.Graphics
    private lastHealth = 100

    private timePos !: Phaser.GameObjects.Rectangle // represents positive time
    private timeNeg !: Phaser.GameObjects.Rectangle // represents negative time
    
    private initialTime: number
    private initialTimeBarLength = 150

    private timeBarX = 200
    private timeBarY = 30
    private timeBarHeight = 20

    constructor()
    {
        super({//the key of our scene; it will be playing simultaneously as Game scene
            key: 'status-display'
        })
    }


    init()
    {
        this.starsCollected = 0 // reset to 0

    }
     
    create()
    {
        
        this.graphics = this.add.graphics()

        // this.setHealthBar(100)
        
        this.starsLabel = this.add.text(10,35, 'Stars: 0',{
            fontSize: '0px'
        })

        this.setUpTime()

        events.on('star-collected', this.handleStarCollected, this)
        events.on('timerIncrement', this.updateTimeBar, this)
        events.on('startedTime', this.setStartTime, this)


        // clean up of resources that we know we need for later.. 
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            events.off('star-collected', this.handleStarCollected, this)
        })
    }
    
    // private setHealthBar(value: number){
    //     const width = 200
    //     const percent = Phaser.Math.Clamp(value, 0, 100) / 100 // normalize within 0 and 1
    //     // console.log(value)
    //     this.graphics.clear() //clearing it out since this gets reset often
    //     this.graphics.fillStyle(0x808080) // set the back bar to be gray
    //     this.graphics.fillRoundedRect(100,10,width,20, 5)
    //     if (percent > 0){
    //         this.graphics.fillStyle(0x00ff00) // set another rectangle that is green
    //         this.graphics.fillRoundedRect(10,10,width * percent,20, 5) // fit it within the bar    
    //     } 
        
    // }

    private setStartTime(initialTime:number) {
        this.initialTime = initialTime
        console.log("set initial time", initialTime, this.initialTime)
    }

    private handleStarCollected()
    {
        this.starsCollected +=1 // can also do ++this.starsCollected
        this.starsLabel.text = `Stars:  ${this.starsCollected}` // string interpolation :) 

    }

    private setUpTime(){
        this.timeNeg = this.add.rectangle(this.timeBarX, this.timeBarY, this.initialTimeBarLength, this.timeBarHeight, 0x808080)
        this.timePos = this.add.rectangle(this.timeBarX, this.timeBarY, this.initialTimeBarLength, this.timeBarHeight, 0x2c58aa)
    }

    private updateTimeBar(currentTime: number){ 
        const lengthPerTime = this.initialTimeBarLength / this.initialTime
        this.timePos.setSize(Math.ceil(lengthPerTime * currentTime), this.timeBarHeight)
        this.timePos.setPosition(this.timeBarX - .1/2, this.timeBarY)

        if (currentTime < 0.5 * this.initialTime && currentTime > 0.25 * this.initialTime) {
            this.timePos.fillColor = 0x614d79
        }
        else if(currentTime < 0.25 * this.initialTime) {
            this.timePos.fillColor = 0xc22626
        }

        
    }

    // private handleHealthChanged(value: number)
    // {
    //     this.tweens.addCounter({
    //         from: this.lastHealth,
    //         to: value,
    //         duration: 200,
    //         onUpdate: tween => {
    //             const value = tween.getValue() //value between from and two
    //             // console.log(value)
    //             this.setHealthBar(value)
    //         }
    //     })
        
        
    //     this.lastHealth = value
    // }




}