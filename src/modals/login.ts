// Unused, this will be used if we are able to chain modals on day

import { ActionRowBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import ValoBot from "src/ressources/Client";

const ID_INPUT_USERNAME = "username";
const ID_INPUT_PASS = "password";
      
export async function run (client: ValoBot, interaction: ModalSubmitInteraction, tools: any) {
    await interaction.deferReply({ephemeral: true});

    var username = interaction.fields.getTextInputValue(ID_INPUT_USERNAME);
    var password = interaction.fields.getTextInputValue(ID_INPUT_PASS);
    
    var auth = await client.riotAuth.authenticate({username: username, password: password});
    if(!auth) return interaction.reply("Une erreur a eu lieu");
    if (auth.security_type == "response") {
        await client.db.createUser({id: interaction.user.id});
        await client.db.createRiotUser({ user_id: interaction.user.id, ...auth.riot_data })
        interaction.reply("Le login a marché");
    }
    else if (auth.security_type == "multifactor") {
        // interaction.reply("2AF detecté t'es ce genre de mec chiant toi")
    }
    else interaction.reply("Une erreur a eu lieu")
}   

const modalBuilder = new ModalBuilder().setCustomId("login").setTitle("🔒No credentials is stored");

const emailInput = new TextInputBuilder().setCustomId(ID_INPUT_USERNAME)
    .setLabel("Valorant Username")
    .setStyle(TextInputStyle.Short)

const passwordInput = new TextInputBuilder().setCustomId(ID_INPUT_PASS)
    .setLabel("Valorant Password")
    .setStyle(TextInputStyle.Short)
        
const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);

//@ts-ignore
modalBuilder.addComponents(firstActionRow, secondActionRow);

export const modal = modalBuilder;