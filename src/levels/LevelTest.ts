import Phaser from 'phaser'
import Game from './Game'

export default class LevelTest extends Game {
    
    constructor() {
        let tilemapKey = "LevelTest"
        let tilemapJSONFileLocation = "assets/tilemaps/NewHouseMap.json"
        let levelTime = 200
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime)
    }
}
