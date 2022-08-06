import { GatewayIntentBits, Partials } from "discord.js";
import ValoBot from "./ressources/Client";
import * as dotenv from "dotenv";
dotenv.config();

import config from "./config.json";

const client: ValoBot = new ValoBot({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]}, 
    config
);

client.log("log", "Bot is starting...");
client.reload();

client.on("ready", () => {
    client.log("log", "Bot is ready !");
    client.reload();
})

client.on("interactionCreate", async (interaction):Promise<any> => {

  if (!interaction.isCommand()) return;
  if(client.lastInteractionId == interaction.id) return;
  client.lastInteractionId = interaction.id;

  var command:string = interaction.commandName
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
  // @ts-ignore
  var commandData = config.commands[command];
  
  if (!commandData) return;
    
    if(!client.isAdmin(interaction.user) && client.commandsDelay.has(commandData.name)) {
      if(client.isDelaied(interaction.user, commandData.name)) {
        interaction.reply("Merci de patienter " + (client.commandsDelay.get(commandData.name).get(interaction.user.id) - Date.now())/1000 + "sec");
        return;
      }
    }

    
    var whitelisted = false;
    if (commandData.whitelist) {
      if (commandData.whitelist.includes(member.user.id)) whitelisted = true;
    }

    if (commandData.admin && (!client.isAdmin(member.user) && !whitelisted)) return interaction.reply("Cette commande est réservée aux administrateurs").catch(() => {});
    if (commandData.disable && (!client.isAdmin(member.user) && !whitelisted)) return interaction.reply("Cette commande est temporairement désactivée").catch(() => {});
    if (commandData.admin) channel.send("`(Commande admin-only" + (whitelisted ? " (whitelist bypass)" : "") + ")`");
    if (commandData.disable) channel.send("`(Commande désactivée" + (whitelisted ? " (whitelist bypass)" : "") + ")`");

  

  try {
      if(client.config.hotload == true && require.cache[require.resolve(`./commands/${command}.ts`)]) delete require.cache[require.resolve(`./commands/${command}.ts`)];
      let commandFile = require(`./commands/${command}.ts`);
      var data;
      if(typeof commandFile.data == "object") data = commandFile.data;
      if(!data || data.reply != false) await interaction.deferReply({ephemeral: data ? data.ephemeral : undefined});
      // @ts-ignore
      interaction.reply = interaction.editReply;
      // @ts-ignore
      interaction.author = interaction.user;
      commandFile.run(client, interaction, args, {isInteraction: true,});
  } catch (e) {
      client.log("error", e);
  }
})


client.login(process.env.BOT_TOKEN);