const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "purge",
    description: "Delete a specified number of messages from a channel.",
    category: ["moderation"],
    botPermissions: ['ManageMessages'],
    userPermissions: ['ManageMessages'],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: true,
    cooldown: 3000,
    run: async (client, message, args) => {

        try {
            const amount = parseInt(args[0]);

            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | Please specify a number between 1 and 100.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            let reason = args.slice(1).join(" ") || "Not Provided";
            reason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            const embed = new EmbedBuilder()
                .setDescription(`Are you sure you want to delete ${amount} messages?`)
                .setColor(client.color.DEFAULT);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm-purge")
                    .setLabel("Yes")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("cancel-purge")
                    .setLabel("No")
                    .setStyle(ButtonStyle.Danger)
            );

            const msg = await message.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });

            const filter = (i) =>
                i.customId === "confirm-purge" || i.customId === "cancel-purge";
            const collector = msg.createMessageComponentCollector({
                filter,
                time: 15000,
            });

            collector.on("collect", async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({
                        content: "You are not allowed to use this button!",
                        ephemeral: true,
                    });
                }

                if (i.customId === "confirm-purge") {
                    await message.delete().catch(console.error);
                    await msg.delete().catch(console.error);

                    await message.channel.bulkDelete(amount, true).then((deletedMessages) => {
                        const actualDeleted = deletedMessages.size;

                        message.channel
                            .send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(
                                            `${client.emote.utility.success} | Deleted ${actualDeleted} messages.`
                                        )
                                        .setColor(client.color.DEFAULT),
                                ],
                            })
                            .then((sentMessage) => {
                                setTimeout(() => sentMessage.delete().catch(console.error), 5000);
                            });
                    }).catch((error) => {
                        message.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        `${client.emote.utility.cross} | An error occurred while trying to delete messages: ${error.message}`
                                    )
                                    .setColor(client.color.DEFAULT),
                            ],
                        });
                    });
                } else if (i.customId === "cancel-purge") {
                    return i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.emote.utility.cross} | Purge action canceled.`)
                                .setColor(client.color.DEFAULT),
                        ],
                        components: [],
                    });
                }
            });

            collector.on("end", (collected) => {
                if (collected.size === 0) {
                    msg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `${client.emote.utility.cross} | Purge confirmation timed out.`
                                )
                                .setColor(client.color.DEFAULT),
                        ],
                        components: [],
                    }).catch(console.error);
                }
            });
        } catch (error) {
            console.error("Error executing purge command:", error);
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${client.emote.utility.cross} | An error occurred while executing the command.`
                        )
                        .setColor(client.color.DEFAULT),
                ],
            });
        }
    },
};
