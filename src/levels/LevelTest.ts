import Phaser from 'phaser'
import Game from '../levels/Game'

export default class LevelTest extends Game {

    constructor() {

        let tilemapKey = "LevelTest"
        let tilemapJSONFileLocation = "assets/tilemaps/NewHouseMap.json"
    
        super(tilemapKey, tilemapJSONFileLocation)
    }
}
