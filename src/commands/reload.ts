import { CommandInteraction, Message } from "discord.js";
import ValoBot from "src/ressources/Client";

const RELOAD_DONE = "Reload done!";
const RELOAD_FAILED = "Reload failed!"; // I'm f*cking lazy that's crazy
const RELOAD_IN_PROGRESS = "Reloading...";

export async function run (client: ValoBot, message: CommandInteraction, args: string[], tools: any) {
    client.log("loader", RELOAD_IN_PROGRESS);
    await client.reload(client);
    client.log("loader", RELOAD_DONE);
    message.reply(RELOAD_DONE);
}

export const slash = {
    "name": "reload",
    "description": "Recharge le bot"
}