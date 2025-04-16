const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const moment = require("moment");
const os = require("os");
const pkg = require("../../../../../package.json");

module.exports = {
    name: "stats",
    aliases: ["botinfo", "bi"],
    category: "essentials",
    description: "Shows detailed information about the bot.",
    usage: "stats",
    botPermissions: [],
    userPermissions: ['SendMessages'],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: false,
    cooldown: 5000,
    run: async (client, message, args) => {
        try {
            
            const buttons = [
                new ButtonBuilder()
                    .setLabel("Team Info")
                    .setCustomId("team")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel("General Info")
                    .setCustomId("general")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setLabel("\`🗑️\`")
                    .setCustomId("delete")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel("System Info")
                    .setCustomId("system")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel("\`Partners\`")
                    .setCustomId("partners")
                    .setStyle(ButtonStyle.Success),
            ];

            const row = new ActionRowBuilder().addComponents(buttons);

            // Calculate statistics
            const uptime = Date.now() - client.uptime;
            const guilds = client.guilds.cache.size;
            const members = client.guilds.cache.reduce(
                (acc, guild) => acc + guild.memberCount,
                0
            );
            const channels = client.channels.cache.size;
            const cachedUsers = client.users.cache.size;

            // Initial embed
            const embed = new EmbedBuilder()
                .setColor(`#000000`)
                .setAuthor({
                    name: `${client.user.username} Information`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(
                    [
                        "**__General Information__**",
                        `Bot Mention: ${client.user}`,
                        `Bot Tag: ${client.user.tag}`,
                        `Bot Version: ${pkg.version || "1.0.0"}`,
                        `Discord.js: ^v14.18.0 (Keep Updating)`,
                        `Node.js: ${process.version}`,
                        "",
                        "**__Statistics__**",
                        `Servers: ${guilds.toLocaleString()}`,
                        `Users: ${members.toLocaleString()} (${cachedUsers.toLocaleString()} cached)`,
                        `Channels: ${channels.toLocaleString()}`,
                        `Last Restart: ${moment(uptime).fromNow()}`,
                        `Uptime: ${moment.duration(client.uptime).humanize()}`,
                    ].join("\n")
                )
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTimestamp();

            
            const msg = await message.reply({
                embeds: [embed],
                components: [row],
            });

            
            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 60000,
            });

            collector.on("collect", async (interaction) => {
                await interaction.deferUpdate();

                let newEmbed = new EmbedBuilder()
                    .setColor(`#000000`)
                    .setAuthor({
                        name: `${client.user.username} Information`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .setTimestamp();

               
                buttons.forEach((button) =>
                    button.setDisabled(button.data.custom_id === interaction.customId)
                );
                const newRow = new ActionRowBuilder().addComponents(buttons);

                switch (interaction.customId) {
                    case "team":
                        newEmbed.setDescription(
                            [
                                "**__Team Information__**",
                                "",
                                "**Main Developer**",
                                `[1] Wlappiz: `,
                                ` - [GitHub](https://github.com/Wlappiz)`,
                                ` - [Discord](https://discord.com/users/1350436598843441193)`,
                                ` - [Instagram](https://instagram/username/)`,
                                ` - [Reddit](https://URL)`,
                                "",
                            ].join("\n")
                        );
                        break;

                    case "system":
                        const cpuUsage =
                            (process.cpuUsage().user + process.cpuUsage().system) / 1024 / 1024;
                        const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;

                        newEmbed.setDescription(
                            [
                                "**__System Information__**",
                                `Platform: ${os.platform()}`,
                                `CPU Usage: ${cpuUsage.toFixed(2)} MB`,
                                `Memory Usage: ${memUsage.toFixed(2)} MB`,
                                `Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                                `OS Version: ${os.release()}`,
                                `Architecture: ${os.arch()}`,
                                `Node.js: ${process.version}`,
                            ].join("\n")
                        );
                        break;

                    case "partners":
                        newEmbed.setDescription(
                            [
                                "**__Partners__**",
                                "",
                                "No partners currently.",
                                "Contact for partnerships.",
                            ].join("\n")
                        );
                        break;

                    case "general":
                        newEmbed = embed;
                        break;

                    case "delete":
                        await msg.delete().catch(() => { });
                        return;
                }

                await msg.edit({
                    embeds: [newEmbed],
                    components: [newRow],
                });
            });

            collector.on("end", () => {
                buttons.forEach((button) => button.setDisabled(true));
                const disabledRow = new ActionRowBuilder().addComponents(buttons);
                msg.edit({ components: [disabledRow] }).catch(() => { });
            });
        } catch (error) {
            console.error("Stats Command Error:", error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color2)
                        .setDescription(
                            `${client.emote.utility.cross} | An error occurred while retrieving bot statistics.`
                        ),
                ],
            });
        }
    },
};
