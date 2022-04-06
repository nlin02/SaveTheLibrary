import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from './EventCenter'
import PlayerController from './PlayerController'

export default class UI extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text //!: tells us it won't be null
    private starsCollected = 0
    private graphics!: Phaser.GameObjects.Graphics
    private lastHealth = 100
    

    private testLabel!: Phaser.GameObjects.Text  // testLabel
    private accumulatedTime = 100
    private header !: Phaser.GameObjects.Graphics

    private timePos !: Phaser.GameObjects.Rectangle // represents positive time
    private timeNeg !: Phaser.GameObjects.Rectangle // represents negative time
    


    constructor()
    {
        super({//the key of our scene; it will be playing simultaneously as Game scene
            key: 'ui'
        })
    }


    init()
    {
        this.starsCollected = 0 // reset to 0
    }
     
    create()
    {
    
        this.graphics = this.add.graphics()

        this.setHealthBar(100)
        
        this.starsLabel = this.add.text(10,35, 'Stars: 0',{
            fontSize: '32px'
        })

        this.testLabel = this.add.text(500,35, 'Time: 0',{
            fontSize: '32px'
        })

        this.timeNeg = this.add.rectangle(500,25, this.accumulatedTime, 20, 0x808080)
        this.timePos = this.add.rectangle(500, 25, this.accumulatedTime, 20, 0xff0000)

        events.on('star-collected', this.handleStarCollected, this)
        events.on('health-changed', this.handleHealthChanged, this)
        events.on('timer-update', this.updateTime, this)

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
        // this.createHeader()
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

    private updateTime(){
        if(this.accumulatedTime >= 0) {
            this.accumulatedTime -= .1
            this.testLabel.text = `Time: ${this.accumulatedTime}`
            // update position and width of rec
            this.timePos.setSize(this.accumulatedTime, 20)
            this.timePos.setPosition(500 - .1/2, 25)
            
        }
        else{
            events.emit('times-up', PlayerController)
            console.log("time over is detected, event has been called")
            this.accumulatedTime = 0;

        }

    }

    private createHeader(){
        const width = 780

        this.graphics.fillStyle(0xacc8d0) // set the back bar to be gray
        this.graphics.fillRoundedRect(10,10,width, 100, 5)
 
    }



}