import Phaser from 'phaser'
import Game from './Game'

export default class LevelTest extends Game {
    
    constructor() {
        let tilemapKey = "LevelTest"
        // let tilemapJSONFileLocation = "assets/tilemaps/NewHouseMap.json"
        let tilemapJSONFileLocation = "assets/tilemaps/NewAlexandriaMap.json"
        // let tilemapJSONFileLocation = "assets/tilemaps/TombMap.json"

        let levelTime = 500
        let musicKey = 'housemusic'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey)
    }

}
