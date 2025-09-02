const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latecy information.'),
    
    async execute(interaction) {
        const sent = await interaction.reply({
            content: 'Pinging...', fetchReply: true
        });
        const pingTime = sent.createdTimeStamp - interaction.createdTimeStamp;

        await interaction.editReply(`Pong \nBot Latency: ${pingTime} as \nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`)
    },
};