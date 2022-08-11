import ValoBot from "src/ressources/Client";

const fs = require("fs")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);


export default async function loader(this: ValoBot) {
    const config = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8"));
    const commandFiles = fs
      .readdirSync(__dirname + "/../commands")
      .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
      const modalsFiles = fs
        .readdirSync(__dirname + "/../modals")
        .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
      
    this.commandsDelay = new Map();
    var commandsSlash = [];
      for (const file of commandFiles) {
        var file_location = __dirname + `/../commands/${file}`
        try {
          if(require.cache[require.resolve(file_location)]) delete require.cache[require.resolve(file_location)];
        } catch {}
        const command = require(file_location);
        var commandName = file.split(".")[0]
        this.commandsDelay.set(commandName, new Map());
        this.log("debug", "Loaded command /" + commandName)
        if(typeof command.slash == "object") commandsSlash.push(command.slash);
      }

      for (const file of modalsFiles) {
        var file_location = __dirname + `/../modals/${file}`;
        try {
          if(require.cache[require.resolve(file_location)]) delete require.cache[require.resolve(file_location)];
        } catch {}
        const command = require(file_location);
        var modalName = file.split(".")[0]
        this.log("debug", "Loaded modal #" + modalName)
      }

    this.config = config;
    this.prefix = config.prefix;

    this.embedColor = config.embedColor ? config.embedColor : "#ffffff";

    if(this.readyAt != null && this.user) {
        this.user.setActivity(
            `${await this.db.fetchUserSize()} Users`, {
              type: this.config.status.type
            }
        );
        return await (async () => {
          if(!this.application) return;
            try {
              this.log("loader", 'Started refreshing application (/) commands.');
                await rest.put(
                    Routes.applicationCommands(this.application.id),
                    { body: commandsSlash },
                  );
                  this.log("loader", 'Successfully reloaded application (/) commands.');
            } catch (error) {
              this.log("error", error);
              return error;
            }          
          })();
    }
}