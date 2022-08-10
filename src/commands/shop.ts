import { CommandInteraction, EmbedBuilder } from "discord.js";
import ValoBot from "src/ressources/Client";

export async function run (client:ValoBot, interaction:CommandInteraction, args:string[], tool:any):Promise<any> {
    interaction.deferReply();
    var user = await client.db.getUser(interaction.user)
    if(!user) return interaction.editReply("nique ta mere");
    if(!user.riot_users) return interaction.editReply("nique ta mere 2");
    var user_riot = user.riot_users[0];
    var shop = await user_riot.getShop();
    if(!shop) return interaction.editReply("baise la fort");
    var skins = shop.skins;
    var embeds:EmbedBuilder[] = [];
    for(let skin of skins) {
        let embed = new EmbedBuilder().setAuthor({name: skin.displayName!}).setThumbnail(skin.displayIcon!)
        embeds.push(embed)
    }

    interaction.editReply({content: "_ _", embeds: embeds});
}
  
export const slash = {
    "name": "shop",
    "description": "Affiche ton putain de shop"
}