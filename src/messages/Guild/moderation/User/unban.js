const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unban",
    description: "Unban a user from the server.",
    category: ["moderation"],
    botPermissions: ['BanMembers'],
    userPermissions: ['BanMembers'],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: true,
    cooldown: 1000,
    run: async (client, message, args) => {

        try {
            // Validate user input
            const ID = args[0];
            if (!ID) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | Please provide the User ID to unban.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }

            let reason = args.slice(1).join(" ") || "Not Provided";
            reason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            // Attempt to unban the user
            try {
                await message.guild.members.unban(ID);
                const successEmbed = new EmbedBuilder()
                    .setDescription(
                        `${client.emote.utility.success} | Successfully unbanned the user with ID \`${ID}\`.`
                    )
                    .setColor("#000000");
                return message.reply({ embeds: [successEmbed] });
            } catch {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${client.emote.utility.cross} | User with ID \`${ID}\` is not banned or doesn't exist.`
                            )
                            .setColor(client.color.DEFAULT),
                    ],
                });
            }
        } catch (error) {
            console.error("Error executing unban command:", error);
            return message.reply({
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
