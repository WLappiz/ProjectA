const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "kick",
    description: "Kick a user from the server.",
    category: ["moderation"],
    botPermissions: ['KickMembers'],
    userPermissions: ['KickMembers'],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: true,
    cooldown: 10,
    run: async (client, message, args) => {

        try {
            const user = await client.utils.fetchUser(client, message, args[0]);
            if (!user) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | User not found! Recheck User Id.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            let reason = args.slice(1).join(" ") || "Not Provided";
            reason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            const targetMember = await message.guild.members
                .fetch(user.id)
                .catch(() => null);

            if (
                user.id === client.user.id ||
                user.id === message.guild.ownerId ||
                user.id === message.author.id
            ) {
                const descriptions = {
                    [client.user.id]: "You cannot kick me!",
                    [message.guild.ownerId]: "You cannot kick the server owner!",
                    [message.author.id]: "You cannot kick yourself!",
                };
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | ${descriptions[user.id]}`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            const botHighestRole = message.guild.me.roles.highest;
            if (botHighestRole.position <= targetMember.roles.highest.position) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | I cannot kick someone with a higher role than me!`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            if (!message.guild.ownerId ||
                targetMember &&
                message.member.roles.highest.position <=
                targetMember.roles.highest.position
            ) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | You cannot kick someone with a higher role than you!`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            try {
                const dmEmbed = new EmbedBuilder()
                    .setDescription(
                        `${client.emote.moderation.kick} | You have been kicked from **${message.guild.name}**`
                    )
                    .setColor(client.color.DEFAULT)
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {

            }

            await targetMember.kick(reason);

            const successEmbed = new EmbedBuilder()
                .setDescription(
                    `${client.emote.utility.success} | ${user} has been kicked from the server`
                )
                .setColor("#000000");

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error("Error executing kick command:", error);
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
