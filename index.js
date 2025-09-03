require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType,
    PresenceUpdateStatus,
    Events,
    REST,
    Routes
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const comandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of comandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`The Command ${filePath} is missing a required "data" or "execute" property.`)
    }
}

const eventsPath = path.join(__dirname, 'events');

if(fs.existsSync(eventsPath)){
    const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventsFiles){
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

const deployCommands = async () => {
    const commandsJSON = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10'}).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Deploying slash commands...');
        
        await rest.put( Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commandsJSON
        });
        console.log('Commands loaded globally');
    } catch (error){
        console.error('Commands deployment error', error);
    }
};

client.once(Events.ClientReady, async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    await deployComands();

    const statusType = process.env.BOT_STATUS || 'online';
    const activityType = process.env.ACTIVITY_TYPE || 'PLAYING';
    const activityName = process.env.ACTIVITY_NAME || 'Discord';

    const activityTypeMap = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'STREAMING': ActivityType.Streaming,
    };

    const statusMap = {
        'online': PresenceUpdateStatus.Online,
        'idle': PresenceUpdateStatus.Idle,
        'do_not_disturb': PresenceUpdateStatus.DoNotDisturb,
        'invisible': PresenceUpdateStatus.Invisible
    };

    client.user.setPresence({
        status: statusMap[statusType],
        activities: [{
            name: activityName,
            type: activityTypeMap[activityType]
        }]
    });

    console.log(`Bot status set to: ${statusType}`);
    console.log(`Activity set to: ${activityType} ${activityName}`)
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred){
            await interaction.followUp({ content: 'There was an error while executing this command', ephemeral: true });
        } else {
            await interaction.reply({ content: `There was an error while executing this command`, ephemeral: true });
        }
    }
});

client.login(process.env.BOT_TOKEN);