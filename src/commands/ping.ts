import { CommandInteraction, Message } from "discord.js";
import ValoBot from "src/ressources/Client";

export async function run (client:ValoBot, message:CommandInteraction, args:string[], tool:any):Promise<any> {
    return message.reply("Pong!")
  }
  
export const slash = {
    "name": "ping",
    "description": "Affiche le ping du bot"
}