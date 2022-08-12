import { CommandInteraction, EmbedBuilder } from "discord.js";
import ValoBot from "src/ressources/Client";

export async function run (client:ValoBot, interaction:CommandInteraction, args:string[], tool:any):Promise<any> {
    interaction.deferReply();
    var user = await client.db.getUser(interaction.user);
    if(!user) return interaction.editReply("Hahaha t'es pas register ^^");
    if(!user.riot_users.length) return interaction.editReply("Dis donc t'as pas mis de compte riot ou quoi XD");
    var user_riot = user.riot_users[0];
    var refresh = await user_riot.refreshCookies();
    if(!refresh) return interaction.editReply("Cookies expired");
    var shop = await user_riot.getShop();
    if(!shop) return interaction.editReply("Meccc t'as pas de shop wtf!!?");
    var skins = shop.skins;
    var embeds:EmbedBuilder[] = [];
    for(let skin of skins) {
        let embed = new EmbedBuilder().setAuthor({name: skin.displayName!}).setThumbnail(skin.displayIcon!).setDescription(`${skin.price} ${skin.currency?.displayName}`)
        embeds.push(embed)
    }
    interaction.editReply({embeds: embeds});
}
  
export const slash = {
    "name": "shop",
    "description": "Affiche ton putain de shop"
}