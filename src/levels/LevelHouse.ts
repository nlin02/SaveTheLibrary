import Phaser from 'phaser'
import Game from './Game'

export default class LevelHouse extends Game {

    constructor() {
        let tilemapKey = "LevelHouse"
        let tilemapJSONFileLocation = "assets/tilemaps/HouseMap.json"
        let levelTime = 200
        let musicKey = 'housemusic'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey)
    }
}
