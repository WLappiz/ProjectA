const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");

// Define your custom categories and commands
const categories = {
    "🛡️ Antinuke": {
        description: "Coming Soon",
        commands: {
            /*antinuke: {
              description: "Coming Soon",
              usage: "Soon",
            },
            whitelist: {
              description: "Whitelist a user from anti-nuke",
              usage: "whitelist <add/remove> <user>",
            },
            trust: {
              description: "Trust a user with high permissions",
              usage: "trust <user>",
            },*/
        },
    },
    "⚔️ Moderation": {
        description: "Server moderation and management commands",
        commands: {
            role: {
                description: "Role management commands",
                usage:
                    "role <add/remove/give/all> human/bot/everyone<role> role/<user>",
            },
            mute: {
                description: "Mute/Timeout a user",
                usage: "mute/timeout <user> <duration> <reason>",
            },
            unmute: {
                description: "Unmute/Untimeout a user",
                usage: "unmute <user> <reason>",
            },

            ban: {
                description: "Ban a user from the server",
                usage: "ban <user> <reason>",
            },
            kick: {
                description: "Kick a user from the server",
                usage: "kick <user> <reason>",
            },
            warn: {
                description: "Warncommands",
                usage: "warn add/remove/show <user> <reason || Null>",
            },
            unban: {
                description: "Unban a user from the server",
                usage: "unban <user> <reason>",
            },
            setprefix: {
                description: "Change server prefix",
                usage: "setprefix <new_prefix>",
            },
            massban: {
                description: "Ban multiple users from the server",
                usage: "massban <user1> <user2> ... <reason>",
            },
            massunban: {
                description: "Unban multiple users from the server",
                usage: "massunban <user1> <user2> ... <reason>",
            },
            unbanall: {
                description: "Unban all users from the server",
                usage: "unbanall",
            },
            purge: {
                description: "Clear messages in a channel",
                usage: "purge <amount must be between 1 and 100 >",
            },
            addemoji: {
                description: "Add custom emojis to your server",
                usage: "addemoji <emoji/url> [name]",
            },
            roleicon: {
                description: "Set a role's icon",
                usage: "<role> [icon_url/emoji]",
            },
        },
    },
    "🎧 Music": {
        description: "Music playback and control commands",
        commands: {
            Soon: { description: "Music System Coming Soon", usage: "Soon" },
            // "search": { description: "Search and select a song to play", usage: "search <song name>" },
            // "pause": { description: "Pause current playback", usage: "pause" },
            // "resume": { description: "Resume paused playback", usage: "resume" },
            // "stop": { description: "Stop playback and clear queue", usage: "stop" },
            // "skip": { description: "Skip current song", usage: "skip" },
            // "queue": { description: "View music queue", usage: "queue [page]" },
            // "nowplaying": { description: "Show current song info", usage: "nowplaying" },
            // "loop": { description: "Set loop mode", usage: "loop <off/track/queue>" },
            // "shuffle": { description: "Shuffle the queue", usage: "shuffle" },
            // "volume": { description: "Adjust volume", usage: "volume <0-150>" },
            // "lyrics": { description: "Get song lyrics (Premium)", usage: "lyrics [song name]" },
            // "seek": { description: "Seek to position (Premium)", usage: "seek <time in seconds>" }
        },
    },
    "🎫 Support": {
        description: "Ticket system and support commands",
        commands: {
            "ticket setup": {
                description: "Set up the ticket system",
                usage: `Personally love Slash Command for Ticket Setup! Use \n
         Use \`/ticket setup #channel @role #open-ticket-category #closed-ticket-category\`\n
          ticket setup #channel @role #open-ticket-category #closed-ticket-category`,
            },
            "ticket close": { description: "Close a ticket", usage: "ticket close" },
            "ticket delete": {
                description: "Delete a ticket",
                usage: "ticket delete",
            },
            "ticket reopen": {
                description: "Reopen a closed ticket",
                usage: "ticket reopen",
            },
            "ticket reset": {
                description: "Reset ticket configuration",
                usage: "ticket reset",
            },
        },
    },
    "🛠️ Utility": {
        description: "General utility and essential commands",
        commands: {
            help: {
                description: "Shows this help menu",
                usage: "help",
            },
            ping: { description: "Check bot latency", usage: "ping" },
            userinfo: {
                description: "Get user information",
                usage: "userinfo [user]",
            },
            serverinfo: {
                description: "Get server information",
                usage: "serverinfo",
            },
            userinfo: {
                description: "Get user information",
                usage: "serverinfo <user>",
            },
            avatar: {
                description: "Get user's avatar",
                usage: "avatar [user] or avatar --server",
            },
            banner: {
                description: "Get user's banner",
                usage: "banner [user]",
            },
            roleinfo: {
                description: "Get role information",
                usage: "roleinfo [role]",
            },
            servericon: {
                description: "Get server icon",
                usage: "servericon",
            },
            membercount: {
                description: "Get server member count",
                usage: "membercount/mc",
            },
            stat: {
                description: "Get Bot statistics",
                usage: "stat",
            },
            translate: {
                description: "Translate any language to English",
                usage: "reply to a message using &translate",
            },
        },
    },
    "🎮 Fun": {
        description: "Coming Soon",
        /*commands: {
          "8ball": {
            description: "Ask the magic 8ball",
            usage: "8ball <question>",
          },
          meme: { description: "Get a random meme", usage: "meme" },
          joke: { description: "Get a random joke", usage: "joke" },
          coinflip: { description: "Flip a coin", usage: "coinflip" },
        },*/
    },
};

module.exports = {
    name: "help",
    description: "Shows the help menu",
    usage: "help",
    category: "essentials",
    cooldown: 5000,
    run: async (client, message, args) => {
        let currentPage = 0;
        let currentCategory = null;

        // Create initial embed
        const createMainEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Help Menu")
                .setDescription(
                    "Choose a category from the dropdown menu below or use the buttons to navigate.\n\n**Available Categories:**\n" +
                    Object.keys(categories)
                        .map((cat) => `${cat} - ${categories[cat].description}`)
                        .join("\n")
                )
                .setColor(`#000000`)
                .setImage(
                    `https://cdn.discordapp.com/attachments/1316765600529256571/1330795849596534785/Create_a_sleek_and_modern_logo_for_the_bot_named_Araxys_The_design_should_incorporate_a_minimalist_and_bold_style_similar_to_the_Bitzxier_and_Flantic_logos_The_logo_should_feature_a_stylized_wolf_head_f_17.jpg?ex=678f47b7&is=678df637&hm=63a7740b8fb692c4d066ab126f0d85f2c956f9a47de985b0bd73136c6cb2972f&`
                )
                .setFooter({ text: "Created By ARAXYS DEVELOPMENT" });
        };

        // Create category embed
        const createCategoryEmbed = (category, page = 0) => {
            const commands = Object.entries(categories[category].commands);
            const totalPages = Math.ceil(commands.length / 5);
            const start = page * 5;
            const end = start + 5;
            const pageCommands = commands.slice(start, end);

            return new EmbedBuilder()
                .setTitle(`${category} Commands`)
                .setDescription(categories[category].description)
                .addFields(
                    pageCommands.map(([name, data]) => ({
                        name: `${client.config.prefix}${name}`,
                        value: `Description: ${data.description}\nUsage: ${client.config.prefix}${data.usage}`,
                    }))
                )
                .setColor(`#000000`)
                .setFooter({
                    text: `Page ${page + 1
                        }/${totalPages} • Menu will become inactive after 3 minutes`,
                });
        };

        // Create dropdown menu
        const categoryMenu = new StringSelectMenuBuilder()
            .setCustomId("category_select")
            .setPlaceholder("Select a category")
            .addOptions(
                Object.keys(categories).map((cat) => ({
                    label: cat.replace(/[^a-zA-Z ]/g, "").trim(),
                    value: cat,
                    emoji: cat.split(" ")[0],
                    description: categories[cat].description.slice(0, 50),
                }))
            );

        // Create navigation buttons
        const getButtons = (page = 0, category = null) => {
            const totalPages = category
                ? Math.ceil(Object.keys(categories[category].commands).length / 5)
                : 1;

            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(page === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId("main_menu")
                    .setLabel("Main Menu")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel("Support Server")
                    .setURL("https://discord.gg/wwcPCQ2emf")
                    .setStyle(ButtonStyle.Link)
            );
        };

        // Send initial message
        const msg = await message.reply({
            embeds: [createMainEmbed()],
            components: [
                new ActionRowBuilder().addComponents(categoryMenu),
                getButtons(),
            ],
        });

        // Create collector
        const collector = msg.createMessageComponentCollector({
            time: 180000,
            componentType: ComponentType.Any,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: "This menu is not for you!",
                    ephemeral: true,
                });
            }

            try {
                await interaction.deferUpdate();

                if (interaction.customId === "category_select") {
                    currentCategory = interaction.values[0];
                    currentPage = 0;
                    const categoryEmbed = createCategoryEmbed(
                        currentCategory,
                        currentPage
                    );
                    await msg.edit({
                        embeds: [categoryEmbed],
                        components: [
                            new ActionRowBuilder().addComponents(categoryMenu),
                            getButtons(currentPage, currentCategory),
                        ],
                    });
                } else if (
                    interaction.customId === "prev" ||
                    interaction.customId === "next"
                ) {
                    if (interaction.customId === "prev") currentPage--;
                    if (interaction.customId === "next") currentPage++;

                    const newEmbed = currentCategory
                        ? createCategoryEmbed(currentCategory, currentPage)
                        : createMainEmbed();

                    await msg.edit({
                        embeds: [newEmbed],
                        components: [
                            new ActionRowBuilder().addComponents(categoryMenu),
                            getButtons(currentPage, currentCategory),
                        ],
                    });
                } else if (interaction.customId === "main_menu") {
                    currentCategory = null;
                    currentPage = 0;
                    await msg.edit({
                        embeds: [createMainEmbed()],
                        components: [
                            new ActionRowBuilder().addComponents(categoryMenu),
                            getButtons(),
                        ],
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });

        collector.on("end", () => {
            categoryMenu.setDisabled(true);
            const disabledButtons = getButtons(currentPage, currentCategory);
            disabledButtons.components.forEach((button) => button.setDisabled(true));

            msg
                .edit({
                    components: [
                        new ActionRowBuilder().addComponents(categoryMenu),
                        disabledButtons,
                    ],
                })
                .catch(() => { });
        });
    },
};
