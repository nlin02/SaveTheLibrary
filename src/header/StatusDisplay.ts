import { autorun } from 'mobx'
import Phaser from 'phaser'
import { sharedInstance as events } from '../eventcenter/EventCenter'
import PlayerController from '../controllers/PlayerController'
import { timer } from './Timer'

export default class StatusDisplay extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text //!: tells us it won't be null
    private starsCollected = 0
    private graphics!: Phaser.GameObjects.Graphics
    private lastHealth = 100

    private timerText!: Phaser.GameObjects.Text 

    private timePos !: Phaser.GameObjects.Rectangle // represents positive time
    private timeNeg !: Phaser.GameObjects.Rectangle // represents negative time


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
            fontSize: '32px'
        })

        this.timeNeg = this.add.rectangle(500,25, timer.remainingTime, 20, 0x808080)
        this.timePos = this.add.rectangle(500, 25, timer.remainingTime, 20, 0xff0000)

        events.on('star-collected', this.handleStarCollected, this)
        // events.on('health-changed', this.handleHealthChanged, this)

        autorun(() => {
            if(timer.remainingTime >= 0 ) {
                this.updateTime()   
            }
        })

        // clean up of resources that we know we need for later.. 
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            events.off('star-collected', this.handleStarCollected, this)
        })
    }
    
    private setHealthBar(value: number){
        const width = 200
        const percent = Phaser.Math.Clamp(value, 0, 100) / 100 // normalize within 0 and 1
        // console.log(value)
        this.graphics.clear() //clearing it out since this gets reset often
        this.graphics.fillStyle(0x808080) // set the back bar to be gray
        this.graphics.fillRoundedRect(100,10,width,20, 5)
        if (percent > 0){
            this.graphics.fillStyle(0x00ff00) // set another rectangle that is green
            this.graphics.fillRoundedRect(10,10,width * percent,20, 5) // fit it within the bar    
        } 
        
    }


    private handleStarCollected()
    {
        this.starsCollected +=1 // can also do ++this.starsCollected
        this.starsLabel.text = `Stars:  ${this.starsCollected}` // string interpolation :) 

    }

    private updateTime(){
        this.timePos.setSize(timer.remainingTime, 20)
        this.timePos.setPosition(500 - .1/2, 25)
    }

    private handleHealthChanged(value: number)
    {
        this.tweens.addCounter({
            from: this.lastHealth,
            to: value,
            duration: 200,
            onUpdate: tween => {
                const value = tween.getValue() //value between from and two
                // console.log(value)
                this.setHealthBar(value)
            }
        })
        
        
        this.lastHealth = value
    }




}