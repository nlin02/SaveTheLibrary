import Phaser from 'phaser'

import Game from './scenes/Game.js'

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
	scene: [Game]
}

export default new Phaser.Game(config)
