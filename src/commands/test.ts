import { ActionRowBuilder, CommandInteraction, Message, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import ValoBot from "src/ressources/Client";

export async function run (client:ValoBot, message:CommandInteraction, args:string[], tool:any):Promise<any> {
      return;
      
      const modal = new ModalBuilder().setCustomId(Date.now() + "modal").setTitle("🔒We do not store login infos");

      const emailInput = new TextInputBuilder().setCustomId(Date.now() + "emailInput")
            .setLabel("Valorant Username")
            .setStyle(TextInputStyle.Short)

      const passwordInput = new TextInputBuilder().setCustomId(Date.now() + "passwordInput")
            .setLabel("Valorant Password")
            .setStyle(TextInputStyle.Short)

      
      const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
      const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);

      //@ts-ignore
      modal.addComponents(firstActionRow, secondActionRow);
      message.showModal(modal);
}
  
export const slash = {
    "name": "test",
    "description": "Testing features"
}

export const data = {
      "reply": false
}