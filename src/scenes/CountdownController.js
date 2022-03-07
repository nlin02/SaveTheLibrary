export default class CountdownController
{
    /**
     * Use Phaser's clock on this.time in the scene
     */

    /** @type {Phaser.Scene} */
    scene

    /** @type {Phaser.GameObjects.Text} */
    label 

    /** @type {Phaser.Time.TimerEvent} */
    timerEvent
    
    duration = 0


    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.text} label 
     */
    constructor(scene, label)
    {
        this.scene = scene
        this.label = label
    }

    /** 
     * 
     * @param {() => void} callback
     * @param {number} duration 
     * 
     */
    start(callback, duration = 45000)
    {
        this.stop()

        this.finishedCallback = callback // when the timer is done... 
        this.duration = duration

        this.timerEvent = this.scene.time.addEvent({
            delay: duration,
            callback: () => {

                this.label.text = '0'

                this.stop() // delete timer event

                if (callback)
                {
                    callback()
                }
            }
        })
    }

    stop() 
    {
        if (this.timerEvent)
        {
            this.timerEvent.destroy()
            this.timerEvent = undefined
        }
    }

    update()
    {
        if (!this.timerEvent || this.duration <=0) // if there is no timer event; we didn't call start 
        {
            return // do nothing
        }

        const elapsed = this.timerEvent.getElapsed() // get elapsed time from timer in millisecs
        // If we want to count DOWN, the code below shows this:
        const remaining = this.duration - elapsed  // remaining time in millisecs.
        const seconds = remaining / 1000
        
        this.label.text = seconds.toFixed(2)
    
    }
}