import { TextInputAssertions } from "discord.js";
import cookiesStringifier from "src/utils/cookiesStringifier";
import ValoBot from "./Client";

export default class RiotUser implements riot_user {
    client: ValoBot;


    constructor(client:ValoBot,user_data: riot_user) {
        this.client = client;
        this.id = user_data.id;
        this.created_at = user_data.created_at;
        this.user_id = user_data.user_id;
        this.username = user_data.username;
        this.tag = user_data.tag;
        this.skin_alerts = user_data.skin_alerts ?? [];
        this.bundle_alerts = user_data.bundle_alerts ?? [];
        this.access_token = user_data.access_token;
        this.token_id = user_data.token_id;
        this.region = user_data.region;
        this.ssid = user_data.ssid;
        this.expiry_token = user_data.expiry_token;
        this.entitlements_token = user_data.entitlements_token;
        this.cookies = user_data.cookies ?? "";
    }

    /*
    cookiesToText() {
        return `tdid=${this.token_id}`
    }*/

    needRefresh() {
        return Date.now() > this.expiry_token;
    }

    async refreshCookies(force = false) {
        if(!force && !this.needRefresh()) return this.cookies;
        var cookies = await this.client.riotAuth.refreshToken(this.cookies);
        if(!cookies) return;
        this.cookies = cookies.cookies
        this.access_token = cookies.access_token
        this.token_id = cookies.id_token;
        this.expiry_token = cookies.expires_in
        
        this.update({cookies: cookies.cookies, access_token: cookies.access_token, token_id: cookies.id_token, expiry_token: cookies.expires_in})
        return this.cookies;
    }

    update(user_data: db_riot_user) {
        return this.client.db.updateRiotAccount(this.id, user_data).catch((e) => this.client.log("error", e));
    }

    getShop() {
        return this.client.valorantAPI.getUserShop(this);
    }

    getInfo() {
        return this._getInfo();
    }

    getRank() {
        return this.client.valorantAPI.getRank(this);
    }

    private async _getInfo() {
        var data = await this.client.riotAuth.getUserInfo(this.access_token);
        if(!data) return;
        var acct = data.acct;
        this.update({ tag:acct.tag_line, username: acct.game_name, region: data.country })
        return data;
    }

    id: string;
    created_at: any;
    user_id: string;
    username?: string | undefined;
    tag?: string | undefined;
    skin_alerts: string[];
    bundle_alerts: string[];
    access_token: string;
    token_id: string;
    region?: string | undefined;
    ssid: string;
    expiry_token: number;
    entitlements_token: string;
    cookies: string;
}