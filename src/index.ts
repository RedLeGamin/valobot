import { GatewayIntentBits, Partials } from "discord.js";
import ValoBot from "./ressources/Client";
import * as dotenv from "dotenv";
dotenv.config();

import config from "./config.json";

const client: ValoBot = new ValoBot({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    failIfNotExists: false },
    config
);

client.log("log", "Bot is starting...");

client.on("ready", async () => {
    await client.reload();
    client.log("log", "Bot is ready !");
})

client.on("interactionCreate", async (interaction):Promise<any> => {

  var tools:any = {};
  if(interaction.isModalSubmit()) {
    var command = interaction.customId;
    try {
      var file_location = __dirname + `/modals/${command}`;
      if(client.config.hotload && require.cache[require.resolve(file_location)]) delete require.cache[require.resolve(file_location)];
      let commandFile = require(file_location);

      tools = {
        getLocale: (target:string, ...args: string[]) => client.getLocale(interaction.locale, ["commands", command, target], ...args)
      }

      commandFile.run(client, interaction, tools);
    } catch (e) {
      client.log("error", e);
  }
  }

  if(interaction.isCommand()) {

    if(client.lastInteractionId == interaction.id) return;
    client.lastInteractionId = interaction.id;

    var command:string = interaction.commandName;
    var channel = interaction.channel;
    var member = interaction.member;
    var guild = interaction.guild;
    if(!member || !channel || !guild) return;
    var user = member.user;
    var args: never[] = [];

    client.log("userInfo", `${user} used /${command}`);
    
    if (interaction.user.bot) return;
    var config = client.config;
    var alias:any;
    for(var c of [config.commands]) {
      if (c.alias && c.alias.includes(command)) return c;
    }
    if (alias) command = alias.name;

    var commandData = config.commands[command];
    
    if (!commandData) return;

    try {

        var file_location = __dirname + `/commands/${command}`;
        if(client.config.hotload && require.cache[require.resolve(file_location)]) delete require.cache[require.resolve(file_location)];
        let commandFile = require(file_location);
                
        tools = {
          isInteraction: true,
          getLocale: (target:string, ...args: string[]) => client.getLocale(interaction.locale, ["commands", command, target], ...args)
        }

        commandFile.run(client, interaction, args, tools);
    } catch (e) {
        client.log("error", e);
    }
  }
})


client.login(process.env.BOT_TOKEN);