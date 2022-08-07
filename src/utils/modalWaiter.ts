import { CommandInteraction, Interaction, ModalBuilder, ModalSubmitInteraction } from "discord.js";

export default async function modalWaiter (interaction: CommandInteraction, modal: ModalBuilder) {
    interaction.showModal(modal);
}