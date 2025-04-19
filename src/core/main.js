const Subject = require('./client.js');
const client = new Subject({})
const config = require('../config.js')
const { default: chalk } = require('chalk');
const { eventsHandler } = require('../handlers/EventHandler.js');
const { handleCommands } = require('../handlers/HandleCommands.js');
const { prefixHandler } = require('../handlers/prefixcommand.js');
const fs = require('fs');
const path = require('path');
const errorsDir = path.join(__dirname, '../logs/errors');
const { checkMissingIntents } = require('../handlers/requiredIntents.js');
const { antiCrash } = require('../handlers/antiCrash.js');
antiCrash();
const { connect } = require('mongoose');
const startWatchers = require('../handlers/watchFolders.js');
startWatchers();

function ensureErrorDirectoryExists() {
    if (!fs.existsSync(errorsDir)) {
        fs.mkdirSync(errorsDir);
    }
}
function logErrorToFile(error) {
    ensureErrorDirectoryExists();

    const errorMessage = `${error.name}: ${error.message}\n${error.stack}`;

    const fileName = `${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const filePath = path.join(errorsDir, fileName);

    fs.writeFileSync(filePath, errorMessage, 'utf8');
}


(async () => {

    await client.login(config.bot.token).catch((error) => {
        console.error(chalk.red.bold('ERROR: ') + 'Failed to login!');
        console.error(chalk.red(error));
        logErrorToFile(error);
    });

    await connect(client.config.database.mongodbUrl)
        .then(() => console.log('Connected to MongoDB!'))
        .catch((error) => {
            console.error(chalk.red.bold('ERROR: ') + 'Failed to connect to MongoDB:', error);
            logErrorToFile(error);
        });

    if (client.user) {
        console.log(chalk.green.bold('SUCCESS: ') + 'Bot logged in successfully!');
    } else {
        console.error(chalk.red.bold('ERROR: ') + 'Failed to login!');
        return;
    }

    //Load Events
    const eventsPath = '../events';
    await eventsHandler(client, path.join(__dirname, eventsPath));
    checkMissingIntents(client);

    //Load Commands
    const commandsPath = path.join(__dirname, '..', 'commands');
    await handleCommands(client, commandsPath);

    //Load Prefix Commands
    const prefixCommandsPath = path.join(__dirname, '..', 'messages');
    prefixHandler(client, prefixCommandsPath);

})();