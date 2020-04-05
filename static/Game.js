/**
 * Game class on the server to manage the state of existing players and
 * and entities.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Bullet = require('./Bullet')
const Player = require('./Player')
const Powerup = require('./Powerup')

const Constants = require('../lib/Constants')

/**
 * Game class.
 */
class Game {
    /**
     * Constructor for a Game object.
     */
    constructor() {
        /**
         * This is a Map containing all the connected socket ids and socket
         * instances.
         */
        this.clients = new Map()
        /**
         * This is a Map containing all the connected socket ids and the players
         * associated with them. This should always be parallel with sockets.
         */
        this.players = new Map()
        this.projectiles = []
        this.powerups = []

        this.lastUpdateTime = 0
        this.deltaTime = 0
    }

    /**
     * Creates a new Game object.
     * @return {Game}
     */
    static create() {
        const game = new Game()
        game.init()
        return game
    }

    /**
     * Initializes the game state.
     */
    init() {
        this.lastUpdateTime = Date.now()
    }

    /**
     * Creates a new player with the given name and ID.
     * @param {string} name The display name of the player.
     * @param {Object} socket The socket object of the player.
     */
    addNewPlayer(name, socket) {
        this.clients.set(socket.id, socket)
        this.players.set(socket.id, Player.create(name, socket.id))
    }

    /**
     * Removes the player with the given socket ID and returns the name of the
     * player removed.
     * @param {string} socketID The socket ID of the player to remove.
     * @return {string}
     */
    removePlayer(socketID) {
        if (this.clients.has(socketID)) {
            this.clients.delete(socketID)
        }
        if (this.players.has(socketID)) {
            const player = this.players.get(socketID)
            this.players.delete(socketID)
            return player.name
        }
    }

    /**
     * Returns the name of the player with the given socket id.
     * @param {string} socketID The socket id to look up.
     * @return {string}
     */
    getPlayerNameBySocketId(socketID) {
        if (this.players.has(socketID)) {
            return this.players.get(socketID).name
        }
    }

    /**
     * Updates the player with the given socket ID according to the input state
     * object sent by the player's client.
     * @param {string} socketID The socket ID of the player to update
     * @param {Object} data The player's input state
     */
    updatePlayerOnInput(socketID, data) {
        const player = this.players.get(socketID)
        if (player) {
            player.updateOnInput(data)
            if (data.shoot && player.canShoot()) {
                const projectiles = player.getProjectilesFromShot()
                this.projectiles.push(...projectiles)
            }
        }
    }

    /**
     * Updates the state of all the objects in the game.
     */
    update() {
        const currentTime = Date.now()
        this.deltaTime = currentTime - this.lastUpdateTime
        this.lastUpdateTime = currentTime
    }

    /**
     * Sends the state of the game to all connected players.
     */
    sendState() {
        const players = [...this.players.values()]
        this.clients.forEach((client, socketID) => {
            const currentPlayer = this.players.get(socketID)
            this.clients.get(socketID).emit(Constants.SOCKET_UPDATE, {
                self: currentPlayer,
                players: players,
            })
        })
    }
}

module.exports = Game
