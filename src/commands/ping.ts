import { CommandInteraction } from "discord.js";
import ValoBot from "src/ressources/Client";

export async function run (client:ValoBot, message:CommandInteraction, args:string[], tool:any):Promise<any> {
    return message.reply(tool.getLocale("pong", "**INFINITE PING**"))
  }
  
export const slash = {
    "name": "ping",
    "description": "Affiche le ping du bot"
}