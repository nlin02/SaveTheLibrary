import Phaser from 'phaser'
import Game from './Game'

export default class LevelDungeon extends Game {
    
    constructor() {
        let tilemapKey = "LevelDungeon"
        let tilemapJSONFileLocation = "assets/tilemaps/DungeonMap.json"

        super (tilemapKey, tilemapJSONFileLocation)
    }
}