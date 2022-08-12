import ValoBot from "./Client";
import RiotUser from "./RiotUser";

export default class User implements user {

    client: ValoBot;
    id: string;
    created_at: string;
    is_dm_sendable: boolean;
    has_alert: boolean;
    riot_users: RiotUser[];
    cookies: string;

    constructor(client: ValoBot, user_data: user) {
        this.client = client;
        this.id = user_data.id;
        this.created_at = user_data.created_at;
        this.is_dm_sendable = user_data.is_dm_sendable;
        this.has_alert = user_data.has_alert;
        this.cookies = user_data.cookies || "";
        this.riot_users = [];
        for(let riot_user of user_data.riot_users) {
            this.riot_users.push(new RiotUser(this.client, riot_user));
        }
    }

    toogleDM() {
        this.update({is_dm_sendable: !this.is_dm_sendable}).then(() => this.is_dm_sendable = !this.is_dm_sendable)
    }

    toogleAlerts() {
        this.update({has_alert: !this.has_alert}).then(() => this.has_alert = !this.has_alert)
    }


    update(user_data: db_user) {
        return this.client.db.updateUser(this.id, user_data).catch((e) => this.client.log("error", e));
    }

    has_riot_accounts() {
        return this.riot_users.length > 0
    }
    
}