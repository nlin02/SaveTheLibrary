import Phaser from 'phaser'

import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from './scenes/GameOver'
import TitleScene from './scenes/TitleScene'

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'matter',
		matter: {
			debug: true
		}
	},
	scene: [Game, UI, GameOver, TitleScene]
}

export default new Phaser.Game(config)
