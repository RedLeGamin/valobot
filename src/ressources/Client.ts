import { Client, ClientOptions } from "discord.js";
import loader from "../utils/loader";
import RiotAuth from "./RiotAuth";
import SupaBase from "./SupaBase";
import ValorantAPI from "./ValorantAPI";

export interface config {
    prefix: string
    status: { type: number, message: string };
    commands: any;
    hotload: boolean;
    debug?: boolean;
}

export default class ValoBot extends Client {

    reload: any;
    prefix: string;
    lastCommandId: string | undefined;
    lastInteractionId: string | undefined;
    commandsDelay: Map < any, any > ;
    config: config;
    embedColor: string;
    hotload: boolean;
    debug: boolean;
    riotAuth: RiotAuth;
    valorantAPI: ValorantAPI;
    db: SupaBase;

    constructor(options: ClientOptions, config: config) {
        super(options);
        this.reload = loader;
        this.prefix = config.prefix;
        this.lastCommandId;
        this.lastInteractionId;
        this.commandsDelay = new Map();
        this.config = config;
        this.embedColor = "#ffffff";
        this.hotload = config.hotload;
        this.debug = config.debug ?? false;
        this.riotAuth = new RiotAuth(this);
        this.valorantAPI = new ValorantAPI(this);
        this.db = new SupaBase(this);
    }

    isAdmin(user: any) {
        return true;
    }

    delay(user: any, command: string, time: number | null) {
        if (user.id) user = user.id;
        if (!time) this.commandsDelay.get(command).delete(user);
        else this.commandsDelay.get(command).set(user, Date.now() + time);
    }

    isDelaied(user: any, command: string) {
        if (typeof user != "string" && user.id) user = user.id;

        if (!this.commandsDelay.has(command)) this.commandsDelay.set(command, new Map());
        if (this.commandsDelay.get(command).has(user)) {
            if (this.commandsDelay.get(command).get(user) > Date.now()) return true;
            else {
                this.delay(user, command, null);
                return false;
            }
        }
        return false;
    }

    log(type: string, content: any) {
        if(type == "debug" && !this.config.debug) return;
        var log_type = `[${type.toUpperCase()}]`, content;
        if(type == "debug") console.debug(log_type, content);
        else if(type == "error") console.error(log_type, content);
        else console.log(log_type, content);
    }
}