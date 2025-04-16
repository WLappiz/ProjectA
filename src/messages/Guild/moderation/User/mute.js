const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "mute",
    description: "Mute a user in the server.",
    category: ["moderation"],
    botPermissions: ['ModerateMembers'],
    userPermissions: ['ModerateMembers'],
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
                                `${client.emote.utility.cross} | User not found! Recheck User ID.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            let duration = args[1] || "1m"; // Default duration if not provided
            let reason = args.slice(2).join(" ") || "Not Provided";
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
                    [client.user.id]: "You cannot mute me!",
                    [message.guild.ownerId]: "You cannot mute the server owner!",
                    [message.author.id]: "You cannot mute yourself!",
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
                                `${client.emote.utility.cross} | I cannot mute someone with a higher role than me!`
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
                                `${client.emote.utility.cross} | You cannot mute someone with a higher role than you!`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            try {
                const dmEmbed = new EmbedBuilder()
                    .setDescription(
                        `${client.emote.moderation.mute} | You have been muted in **${message.guild.name}** for ${duration}.`
                    )
                    .setColor(client.color.DEFAULT)
                await user.send({ embeds: [dmEmbed] }).catch(() => null);
            } catch (error) {
                console.error("Failed to send DM:", error);
            }

            await targetMember.timeout(ms(duration), reason);

            const successEmbed = new EmbedBuilder()
                .setDescription(
                    `${client.emote.utility.success} | ${user.tag} has been muted in the server for ${duration}.`
                )
                .setColor("#000000");

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error("Error executing mute command:", error);
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
