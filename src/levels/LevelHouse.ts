import Phaser from 'phaser'
import Game from '../levels/Game'

export default class LevelHouse extends Game {

    constructor() {

        let tilemapKey = "LevelHouse"
        let tilemapJSONFileLocation = "assets/TileMaps/HouseMap.json"
    
        super(tilemapKey, tilemapJSONFileLocation)
    }
}
