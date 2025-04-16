/**
 * todo: Create Parameters here
 */
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "addemoji",
    aliases: ["stealemoji", "steal"],
    category: "moderation",
    description: "Add custom emojis to your server.",
    usage: "addemoji <emoji/url> [name]",
    botPermissions: ["ManageGuildExpressions"],
    userPermissions: ["ManageGuildExpressions"],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: true,
    cooldown: 5,
    run: async (client, message, args) => {
        try {
            if (!args[0]) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color.DEFAULT)
                            .setDescription(
                                [
                                    "**Usage:**",
                                    "```",
                                    `${message.guild.prefix}addemoji <emoji/url> [name]`,
                                    "```",
                                    "**Examples:**",
                                    `• ${message.guild.prefix}addemoji 😀`,
                                    `• ${message.guild.prefix}addemoji https://example.com/emoji.png coolEmoji`,
                                    `• ${message.guild.prefix}addemoji <:custom:123456789> newName`,
                                ].join("\n")
                            ),
                    ],
                });
            }

            let emoji = args[0];
            let name = args[1];

            // If custom emoji is provided
            if (emoji.startsWith("<") && emoji.endsWith(">")) {
                const id = emoji.match(/\d{15,}/g)[0];
                const type = emoji.startsWith("<a:") ? "gif" : "png";
                const url = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;

                if (!name) {
                    name = emoji.split(":")[1];
                }

                emoji = url;
            }

            const urlRegex = /(http[s]?:\/\/.*\.(?:png|jpg|gif))/i;
            if (!urlRegex.test(emoji)) {

                const unicodeRegex =
                    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
                if (!unicodeRegex.test(emoji)) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color.DEFAULT)
                                .setDescription(
                                    `${client.emote.utility.cross} | Please provide a valid emoji or image URL.`
                                ),
                        ],
                    });
                }
            }

            if (!name) {
                name = "emoji_" + Math.random().toString(36).substring(2, 8);
            }

            if (!/^[a-zA-Z0-9_]+$/.test(name)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color.DEFAULT)
                            .setDescription(
                                `${client.emote.utility.cross} | Emoji name can only contain letters, numbers, and underscores.`
                            ),
                    ],
                });
            }
            const loadingMessage = await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color.DEFAULT)
                        .setDescription("🔄 Adding emoji to the server..."),
                ],
            });

            try {
                const newEmoji = await message.guild.emojis.create({
                    attachment: emoji,
                    name: name,
                });

                return loadingMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color.DEFAULT)
                            .setTitle(`${client.emote.utility.success} | Emoji Added Successfully`)
                            .setDescription(
                                [
                                    `**Name:** \`:${newEmoji.name}:\``,
                                    `**ID:** \`${newEmoji.id}\``,
                                    `**Preview:** ${newEmoji.toString()}`,
                                    "",
                                    `**Added By:** ${message.author.toString()}`,
                                ].join("\n")
                            )
                            .setThumbnail(newEmoji.url)
                            .setTimestamp(),
                    ],
                });
            } catch (error) {
                return loadingMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color2)
                            .setDescription(
                                `${client.emote.utility.cross} | Failed to add emoji: ${error.message}`
                            ),
                    ],
                });
            }
        } catch (error) {
            console.error("Error in addemoji command:", error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color2)
                        .setDescription(
                            `${client.emote.utility.cross} | An error occurred while trying to add the emoji.`
                        ),
                ],
            });
        }
    },
};
