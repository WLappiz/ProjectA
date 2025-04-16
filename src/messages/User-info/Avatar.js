module.exports = {
  name: "avatar",
  description: "Get avatar of user.",
  aliases: ["aliases"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: ["SendMessages"],
  adminOnly: false,
  ownerOnly: false,
  devSev: false,
  devOnly: false,
  SVOnly: false,
  cooldown: 10,
  run: async (client, message, args) => {
    try {
      // Get the target user from mention or ID; fallback to message author
      let target;
      if (args[0]) {
        try {
          target =
            (await getUserFromMention(message, args[0])) ||
            (await client.users.fetch(args[0]));
        } catch {
          target = message.author;
        }
      } else {
        target = message.author;
      }

      // Determine if this command is used in a guild channel or DM
      const isDM = !message.guild;
      let member = null;
      if (!isDM) {
        // If in a guild, get the member object for server-specific avatar
        member =
          target.id === message.author.id
            ? message.member
            : await message.guild.members.fetch(target.id).catch(() => null);
      }

      // Create the common buttons: Global Avatar and User Banner
      const globalButton = new ButtonBuilder()
        .setCustomId("global_avatar")
        .setLabel("Global Avatar")
        .setStyle(ButtonStyle.Primary);

      const bannerButton = new ButtonBuilder()
        .setCustomId("user_banner")
        .setLabel("User Banner")
        .setStyle(ButtonStyle.Secondary);

      // Start with a row that will hold the button components
      const buttonsRow = new ActionRowBuilder().addComponents(
        globalButton,
        bannerButton
      );
      const components = [buttonsRow];

      // If in a guild channel, add a server avatar button; otherwise, add a select menu
      if (!isDM) {
        const serverAvatarButton = new ButtonBuilder()
          .setCustomId("server_avatar")
          .setLabel("Server Avatar")
          .setStyle(ButtonStyle.Secondary)
          // Disable button if no member data exists or if the server avatar
          // is the same as the global avatar (i.e. no custom server avatar)
          .setDisabled(
            !member || member.displayAvatarURL() === target.displayAvatarURL()
          );
        buttonsRow.addComponents(serverAvatarButton);
      } else {
        // In DM, prepare a select menu listing all mutual servers (servers where
        // the bot and the user are both present).
        const mutualGuilds = client.guilds.cache.filter((g) =>
          g.members.cache.has(message.author.id)
        );
        if (mutualGuilds.size > 0) {
          const options = mutualGuilds
            .map((g) => ({
              label: g.name.length > 25 ? g.name.slice(0, 22) + "..." : g.name,
              value: g.id,
              description: `View avatar in ${g.name}`,
            }))
            .toArray();
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("dm_server_avatar")
            .setPlaceholder("Select a server for server avatar")
            .addOptions(options);
          const selectRow = new ActionRowBuilder().addComponents(selectMenu);
          components.push(selectRow);
        }
      }

      // Create the initial embed showing the global avatar
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${target.tag}'s Global Avatar`,
          iconURL: target.displayAvatarURL({ dynamic: true }),
        })
        .setImage(target.displayAvatarURL({ size: 4096, dynamic: true }))
        .setColor(client.color)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      const sentMsg = await message.channel.send({
        embeds: [embed],
        components: components,
      });

      // Set up a collector for button/select menu interactions
      const collector = sentMsg.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        // Only allow the command invoker to interact
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: `${client.emote.utility.cross} | This interactive element is not for you!`,
            ephemeral: true,
          });
        }

        await interaction.deferUpdate();
        const newEmbed = new EmbedBuilder().setColor(client.color).setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

        // Handle button interactions
        if (interaction.isButton()) {
          switch (interaction.customId) {
            case "global_avatar":
              newEmbed
                .setAuthor({
                  name: `${target.tag}'s Global Avatar`,
                  iconURL: target.displayAvatarURL({ dynamic: true }),
                })
                .setImage(
                  target.displayAvatarURL({ size: 4096, dynamic: true })
                );
              break;
            case "server_avatar":
              if (!isDM && member) {
                newEmbed
                  .setAuthor({
                    name: `${target.tag}'s Server Avatar`,
                    iconURL: target.displayAvatarURL({ dynamic: true }),
                  })
                  .setImage(
                    member.displayAvatarURL({ size: 4096, dynamic: true })
                  );
              }
              break;
            case "user_banner":
              {
                // Fetch the user to refresh banner info
                const user = await client.users.fetch(target.id, {
                  force: true,
                });
                if (user.banner) {
                  newEmbed
                    .setAuthor({
                      name: `${target.tag}'s Banner`,
                      iconURL: target.displayAvatarURL({ dynamic: true }),
                    })
                    .setImage(user.bannerURL({ size: 4096, dynamic: true }));
                } else {
                  newEmbed
                    .setAuthor({
                      name: `${target.tag}'s Banner`,
                      iconURL: target.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(
                      `${client.emote.utility.cross} | This user doesn't have a banner!`
                    );
                }
              }
              break;
          }
        }
        // Handle select menu interactions (DM-only)
        else if (interaction.isStringSelectMenu()) {
          if (interaction.customId === "dm_server_avatar") {
            const selectedGuildId = interaction.values[0];
            const guild = client.guilds.cache.get(selectedGuildId);
            if (guild) {
              let guildMember;
              try {
                guildMember = await guild.members.fetch(target.id);
              } catch (err) {
                newEmbed.setAuthor({
                  name: `Server Avatar in ${guild.name}`,
                  iconURL: target.displayAvatarURL({ dynamic: true }),
                });
                newEmbed.setDescription(
                  `${client.emote.utility.cross} | Unable to fetch the server avatar. The bot may not have the required permissions or the member data is unavailable.`
                );
                await interaction.editReply({
                  embeds: [newEmbed],
                  components: components,
                });
                return;
              }
              newEmbed
                .setAuthor({
                  name: `${target.tag}'s Server Avatar from ${guild.name}`,
                  iconURL: target.displayAvatarURL({ dynamic: true }),
                })
                .setImage(
                  guildMember.displayAvatarURL({ size: 4096, dynamic: true })
                );
            } else {
              newEmbed.setDescription(
                `${client.emote.utility.cross} | Selected server not found.`
              );
            }
          }
        }

        await interaction.editReply({
          embeds: [newEmbed],
          components: components,
        });
      });

      // Disable all components when the collector times out
      collector.on("end", async () => {
        const disabledComponents = components.map((row) => {
          row.components.forEach((comp) => comp.setDisabled(true));
          return row;
        });
        await sentMsg.edit({ components: disabledComponents }).catch(() => {});
      });
    } catch (error) {
      console.error("Avatar Command Error:", error);
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `${client.emote.utility.cross} | Failed to fetch avatar. Please try again.`
            ),
        ],
      });
    }
  },
};
