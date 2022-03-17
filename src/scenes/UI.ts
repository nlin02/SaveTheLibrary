import Phaser from 'phaser'
import { sharedInstance as events } from './EventCenter'

export default class UI extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text //!: tells us it won't be null
    private starsCollected = 0;

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
        this.starsLabel = this.add.text(10,10, 'Stars: 0',{
            fontSize: '32px'
        })

        events.on('star-collected', this.handleStarCollected, this)

        // clean up of resources that we know we need for later.. 
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            events.off('star-collected', this.handleStarCollected, this)
        })
    }

    private handleStarCollected()
    {
        this.starsCollected +=1 // can also do ++this.starsCollected
        this.starsLabel.text = `Stars:  ${this.starsCollected}` // string interpolation :) 

    }


}