import Phaser from 'phaser'
import Game from './Game'

export default class LevelHouse extends Game {

    constructor() {
        let tilemapKey = "LevelHouse"
        let tilemapJSONFileLocation = "assets/tilemaps/NewHouseMap.json"

        let levelTime = 500
        let musicKey = 'housemusic'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey)
    }
}
