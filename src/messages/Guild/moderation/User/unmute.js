const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "unmute",
    aliases: ["untimeout"],
    description: "Unmute or untimeout a user in the server.",
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

            let reason = args.slice(1).join(" ") || "Not Provided";
            reason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            const targetMember = await message.guild.members
                .fetch(user.id)
                .catch(() => null);

            if (!targetMember) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | Unable to fetch the member!`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            if (!targetMember.communicationDisabledUntilTimestamp) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | This user is not currently muted!`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            try {
                const dmEmbed = new EmbedBuilder()
                    .setDescription(
                        `${client.emote.moderation.unmute} | You have been unmuted in **${message.guild.name}**`
                    )
                    .setColor(client.color.DEFAULT)
                await user.send({ embeds: [dmEmbed] }).catch(() => null);
            } catch (error) {
                console.error("Failed to send DM:", error);
            }

            await targetMember.timeout(null);

            const successEmbed = new EmbedBuilder()
                .setDescription(
                    `${client.emote.utility.success} | ${user.tag} has been unmuted in the server.`
                )
                .setColor("#000000");

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error("Error executing unmute command:", error);
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
