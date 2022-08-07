import { CommandInteraction } from "discord.js";
import ValoBot from "src/ressources/Client";
import { modal } from "../modals/login"

export async function run (client:ValoBot, message:CommandInteraction, args:string[], tool:any):Promise<any> {
      message.showModal(modal);
}
  
export const slash = {
      "name": "login",
      "description": "Login with your riot account"
}