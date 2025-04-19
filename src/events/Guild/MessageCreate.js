const { default: chalk } = require("chalk");
const config = require('../../config');
const { EmbedBuilder, Collection, PermissionFlagsBits } = require('discord.js');
const { getSimilarCommands } = require('../../handlers/Similarity');
const path = require('path');
const fs = require('fs');
const { RateLimiter } = require('discord.js-rate-limiter');
const errorsDir = path.join(__dirname, '../../../logs/errors');


function ensureErrorDirectoryExists() {
    if (!fs.existsSync(errorsDir)) {
        fs.mkdirSync(errorsDir);
    }
}

function logErrorToFile(error) {
    ensureErrorDirectoryExists();

    const errorMessage = `${error.name}: ${error.message}\n${error.stack}`;

    const fileName = `${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const filePath = path.join(errorsDir, fileName);

    fs.writeFileSync(filePath, errorMessage, 'utf8');
}


module.exports = {
    name: 'messageCreate',
    async execute(message, client) {

        const prefix = config.prefix.value;
        const content = message.content.toLowerCase();
        if (prefix === '') return;
        if (!content.startsWith(prefix) || message.author.bot) return;

        const args = content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.prefix || client.prefix.size === 0) {
            return;
        }

        let command = client.prefix.get(commandName);
        if (!command) {
            command = Array.from(client.prefix.values()).find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );
        }

        if (message.guild) {
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
                const embed = new EmbedBuilder()
                    .setColor(client.color.DANGER)
                    .setDescription(
                        `${client.emote.utility.cross} | I lack the necessary permissions to send messages in this server\n` +
                        `Server Name: ${message.guild.name}.`
                    )
                    .setTimestamp();

                message.guild.fetchOwner()
                    .then(owner => {
                        owner.user.send({ embeds: [embed] })
                            .then(() => console.log("DM sent successfully"))
                            .catch(error => console.error("Failed to send DM to the owner:", error));
                    })
                    .catch(error => {
                        console.error("Failed to fetch the guild owner:", error);
                    });
                return;
            }
        }

        if (!command) {
            const similarCommands = getSimilarCommands(commandName, Array.from(client.prefix.values()));
            if (similarCommands.length > 0) {
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`\`🤔\` | Command not found. Did you mean: ${similarCommands.join(', ')}?`)

                return await message.reply({ embeds: [embed] });
            } else {
                return;
            }
        }


        if (command.devSev) {
            if (!config.bot.developerCommandsServerIds.includes(message.guild?.id)) {
                return;
            }
        }
        if (command.devOnly) {
            if (!config.bot.devIds.includes(message.author.id)) {
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`❌ | This command is developer-only. You cannot run this command.`)
                    .addField('Developer Server', `https://discord.gg/${config.bot.LinkPass}`)
                return await message.reply({
                    embeds: [embed]
                });
            }
        }

        if (command.SVOnly && !message.guild) {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`❌ | This command is server-only. You cannot run this command in a DM channel.`)
            return await message.reply({
                embeds: [embed]
            });
        } else { true }

        const now = Date.now();
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Map());
        }

        const timestamps = client.cooldowns.get(command.name);

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`\`❌\` | Please wait **${timeLeft.toFixed(1)}** more second(s) before reusing the \`${command.name}\` command.`)

                return message.reply({
                    embeds: [embed]
                });
            }
        }

        timestamps.set(message.author.id, now);

        if (command.adminOnly && !config.bot.admins.includes(message.author.id)) {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`\`❌\` | This command is admin-only. You cannot run this command.`)

            return message.reply({
                embeds: [embed]
            });
        }


        if (command.ownerOnly && message.author.id !== config.bot.ownerId) {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`\`❌\` | This command is owner-only. You cannot run this command.`)

            return await message.reply({
                embeds: [embed],
            });
        }

        if (message.guild) {
            if (command.userPermissions) {
                const memberPermissions = message.member.permissions;
                const missingPermissions = command.userPermissions.filter(perm => !memberPermissions.has(perm));
                if (missingPermissions.length) {
                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setDescription(`\`❌\` | You lack the necessary permissions to execute this command: \`\`\`${missingPermissions.join(", ")}\`\`\``)

                    return message.reply({
                        embeds: [embed],
                    });
                }
            }

            if (command.botPermissions) {
                const botPermissions = message.guild.members.me.permissions;
                const missingBotPermissions = command.botPermissions.filter(perm => !botPermissions.has(perm));
                if (missingBotPermissions.length) {
                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setDescription(`\`❌\` | I lack the necessary permissions to execute this command: \`\`\`${missingBotPermissions.join(", ")}\`\`\``)

                    return message.reply({
                        embeds: [embed],
                    });
                }
            }
        } else { true }

        if (message.guild) {
            let rateLimiter = new RateLimiter(1, 2000);
            let limited = rateLimiter.take(message.author.id);
            if (limited && message.author.id !== config.bot.ownerId) {
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`\`❌\` | You are being rate limited. Please try again later.`)

                return message.reply({
                    embeds: [embed],
                })
            }
        }

        try {
            if (command.execute) {
                await command.execute(message, args);
            } else if (command.run) {
                await command.run(client, message, args);
            } else {
                return;
            }

            // Build the log embed dynamically based on whether message.guild exists
            const logEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Command Executed')
                .addFields(
                    { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Command', value: `${config.prefix.value}${command.name}`, inline: true },
                    { name: 'Timestamp', value: new Date().toLocaleString(), inline: true }
                )
                .setTimestamp();

            if (message.guild) {
                logEmbed.addFields({ name: 'Server', value: `${message.guild.name} (${message.guild?.id})`, inline: true });
            } else {
                logEmbed.addFields({ name: 'Channel', value: 'DM', inline: true });
            }

            if (config.logging.commandLogsChannelId) {
                const logsChannel = client.channels.cache.get(config.logging.commandLogsChannelId);
                if (logsChannel) {
                    await logsChannel.send({ embeds: [logEmbed] });
                } else {
                    if (config.logging.commandLogsChannelId === 'COMMAND_LOGS_CHANNEL_ID') return;
                    console.error(chalk.yellow(`Logs channel with ID ${config.logging.commandLogsChannelId} not found.`));
                }
            }
        } catch (error) {
            console.log(chalk.default.red.bold('ERROR: ') + `Failed to execute command "${commandName}".`);
            console.error(error);
            message.reply({
                content: 'There was an error while executing this command!',
            });
            logErrorToFile(error);
        }

    }
};