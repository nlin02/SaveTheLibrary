import Phaser from 'phaser'
import Game from './Game'

export default class LevelTomb extends Game {
    
    constructor() {
        let tilemapKey = "LevelTomb"
        let tilemapJSONFileLocation = "assets/tilemaps/LevelTomb.json"
        let levelTime = 800
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime)
    }
}