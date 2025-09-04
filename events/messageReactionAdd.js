const { Events } = require('discord.js');
const { execute } = require('../commands/ping');

module.exports = {
    name: Events.MessageReactionAdd,
    once: true,
    execute (client) {
        console.log(`Logged in as ${client.user.tag}`);
    },
};