import Phaser from 'phaser'
import StateMachine from '../StateMachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class UI extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text //!: tells us it won't be null
    private starsCollected = 0
    private graphics!: Phaser.GameObjects.Graphics
    private lastHealth = 100
    private stateMachine: StateMachine
    

    private testLabel!: Phaser.GameObjects.Text  // testLabel
    private accumulatedTime = 1000
    private header !: Phaser.GameObjects.Graphics

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
        // this.createHeader()

        this.setHealthBar(100)
        
        this.starsLabel = this.add.text(10,35, 'Stars: 0',{
            fontSize: '32px'
        })

        this.testLabel = this.add.text(500,35, 'Time: 0',{
            fontSize: '32px'
        })
        
        

        


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
        this.graphics.fillRoundedRect(10,10,width,20, 5)
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
        // this.tweens.addCounter({
        //     from: 0,
        //     to: 100,
        //     duration: 1,
        //     onUpdate: tween => {
        //         if(this.accumulatedTime < 1000){
        //             const value = tween.getValue() / 100
        //             this.accumulatedTime += value
        //             this.testLabel.text = `Time: ${this.accumulatedTime}`
        //         }
        //         else{
        //             this.stateMachine.setState('dead')

        //         }
                
        //     }
        // })

        if(this.accumulatedTime > 0) {
            this.accumulatedTime -=1
            this.testLabel.text = `Time: ${this.accumulatedTime}`
        }
        else{
             this.stateMachine.setState('dead')

        }

    }

    private createHeader(){
        const width = 780

        this.graphics.fillStyle(0xacc8d0) // set the back bar to be gray
        this.graphics.fillRoundedRect(10,10,width, 100, 5)
 
    }



}