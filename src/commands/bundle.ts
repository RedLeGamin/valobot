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
    
    var bundles = shop.bundles;
    var embeds:EmbedBuilder[] = [];

    for(let bundle of bundles) {
        let skins = bundle.skins;
        let items = bundle.items;
        let embed = new EmbedBuilder()
            .setTitle(`Bundle en avant: ${bundle.displayName}`)
            .setImage(bundle.displayIcon!)
            .setDescription(`${bundle.currency?.displayName} **${bundle.discountPrice}** ~~${bundle.price}~~`)
            .setColor("#ff4655")
        embeds.push(embed)

        if(skins) for(let skin of skins) {
            let embed = new EmbedBuilder()
                .setThumbnail(skin.displayIcon!)
                .setDescription(`> **${skin.displayName}**\n> ${skin.currency?.displayName} ${skin.price! > skin.discountPrice! ? `**${skin.discountPrice}** ~~${skin.price}~~` : `**${skin.price}**`}`)
                .setColor("#202225")
            embeds.push(embed)
        }

        if(items) for(let item of items) {
            let embed = new EmbedBuilder()
                .setThumbnail(item.displayIcon!)
                .setDescription(`> **${item.displayName?.["fr-FR"]}**\n> ${item.currency?.displayName} ${item.price! > item.discountPrice! ? `**${item.discountPrice}** ~~${item.price}~~` : `**${item.price}**`}`)
                .setColor("#202225")
            embeds.push(embed)
        }
    }
    interaction.editReply({embeds: embeds});
}
  
export const slash = {
    "name": "bundle",
    "description": "Affiche tes putains de bundles"
}