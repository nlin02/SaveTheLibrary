import Phaser from 'phaser'

import UI from './header/StatusDisplay'
import GameOver from './screens/GameOverScreen'
import TitleScene from './screens/HomeScreen'
import EmailScreen from './screens/EmailScreen'
import Win from './screens/WinScreen'
import TimeTravelScreen from './screens/TimeTravelScreen'
import LevelAlexandria from './levels/LevelAlexandria'
import LevelHouse from './levels/LevelHouse'
import LevelTomb from './levels/LevelTomb'

var config = {
	type: Phaser.AUTO,
	mode: Phaser.Scale.FIT,
	autoCenter: Phaser.Scale.CENTER_BOTH,
	width: 800,
	height: 600,
	physics: {
		default: 'matter',
		matter: {
			debug: false
		}
	},
	scene: [TitleScene, EmailScreen, LevelAlexandria, LevelHouse, LevelTomb, UI, GameOver, TimeTravelScreen, Win]
}

export default new Phaser.Game(config)
