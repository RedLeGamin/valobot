import { CommandInteraction } from "discord.js";
import ValoBot from "src/ressources/Client";

const RELOAD_DONE = "Reload done!";
const RELOAD_FAILED = "Reload failed";
const RELOAD_IN_PROGRESS = "Reloading...";

export async function run (client: ValoBot, message: CommandInteraction, args: string[], tools: any) {
    client.log("loader", RELOAD_IN_PROGRESS);
    await message.reply(RELOAD_IN_PROGRESS);

    var load = await client.reload(client);
    
    if(load) {
        client.log("loader", RELOAD_FAILED);
        message.editReply(RELOAD_FAILED + " (Please check logs for details)");
    }
    
    else {
        client.log("loader", RELOAD_DONE);
        message.editReply(RELOAD_DONE);
    }
}

export const slash = {
    "name": "reload",
    "description": "Recharge le bot"
}