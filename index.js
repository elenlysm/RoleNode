require('dotenv').config();

const {REST, routes, Client} = require('discord.js');
const deployComands = async () => {
    //command logic
};

const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType,
    PresenceUpdateStatus,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const comandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of comandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command){
        client.commands.set(comandFiles.data.name, command);
    } else {
        console.log(`The Command ${filePath} is missing a required "data" or "execute" property.`)
    }
}

client.commands = new Collection();

