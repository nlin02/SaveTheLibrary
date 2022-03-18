// each spike has a name and an id which we use to create a key
const createKey = (name: string, id: number) => {
    return `${name}-${id}`
}

export default class ObstaclesController
{
    // obstacle map with strings for keys and BodyType as value
    private obstacles = new Map<string, MatterJS.BodyType>()

    // function to add a new obstacle to the obstacles map
    add(name:string, body: MatterJS.BodyType) 
    {
        const key = createKey(name, body.id)
        if(this.obstacles.has(key)) 
        {
            throw new Error('obstacle already exists that has this key')
        }
        this.obstacles.set(key,body)
    }

    // function to check whether 
    is(name: string, body: MatterJS.BodyType) 
    {
        const key = createKey(name, body.id)
        if(!this.obstacles.has(key)) 
        {
            return false
        }
        return true
    }
}

