const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "roleicon",
    aliases: ["ricon", "ri"],
    category: ["moderation", "sentinels"],
    description: "View or set a role's icon.",
    usage: "roleicon <role> [icon_url]",
    botPermissions: ["ManageRoles"],
    userPermissions: ["ManageRoles"],
    adminOnly: false,
    ownerOnly: false,
    devSev: false,
    devOnly: false,
    SVOnly: true,
    cooldown: 5,
    run: async (client, message, args) => {
        try {
            
            const role =
                message.mentions.roles.first() ||
                message.guild.roles.cache.get(args[0]) ||
                message.guild.roles.cache.find(
                    (r) => r.name.toLowerCase() === args[0]?.toLowerCase()
                );

            if (!role) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color.DEFAULT)
                            .setDescription(
                                `${client.emote.utility.cross} | Please provide a valid role.`
                            ),
                    ],
                });
            }

            
            if (!args[1]) {
                const embed = new EmbedBuilder()
                    .setColor(client.color.DEFAULT)
                    .setTitle(`Role Icon: ${role.name}`)
                    .setDescription(
                        role.iconURL()
                            ? `[Click here to view icon](${role.iconURL({
                                size: 4096,
                            })})`
                            : "This role has no icon."
                    )
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({
                            dynamic: true,
                        }),
                    });

                if (role.iconURL()) {
                    embed.setThumbnail(role.iconURL({ size: 4096 }));
                }

                return message.reply({ embeds: [embed] });
            }

            
            if (!role.editable) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color.DEFAULT)
                            .setDescription(
                                `${client.emote.utility.cross} | I cannot edit this role. Ensure my role is above the target role.`
                            ),
                    ],
                });
            }

            try {
                await role.setIcon(args[1]);

                const embed = new EmbedBuilder()
                    .setColor(client.color.DEFAULT)
                    .setTitle("Role Icon Updated")
                    .setDescription(
                        `Successfully updated the icon for the role ${role}`
                    )
                    .setThumbnail(role.iconURL({ size: 4096 }))
                    .setFooter({
                        text: `Updated by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({
                            dynamic: true,
                        }),
                    });

                message.reply({ embeds: [embed] });
            } catch (error) {
                console.error("Error updating role icon:", error);
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color2)
                            .setDescription(
                                `${client.emote.utility.cross} | Failed to set the role icon. Ensure the URL is valid and the server has the required boosts.`
                            ),
                    ],
                });
            }
        } catch (error) {
            console.error("Roleicon Command Error:", error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color2)
                        .setDescription(
                            `${client.emote.utility.cross} | An error occurred while managing the role icon.`
                        ),
                ],
            });
        }
    },
};
