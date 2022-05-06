import Game from './Game'

export default class LevelHouse extends Game {

    constructor() {
        let tilemapKey = "LevelHouse"
        let tilemapJSONFileLocation = "assets/TileMaps/HouseMap.json"
        let levelTime = 400
        let musicKey = 'housemusic'

        let foregroundImageKey = 'houses'
        let midgroundImageKey = 'clouds'
        let backgroundImageKey = 'sky'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey, foregroundImageKey, midgroundImageKey,backgroundImageKey)
    }
}