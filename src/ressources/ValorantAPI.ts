import axios from "axios"
import ValoBot from "./Client";
import NodeCache from "node-cache"
import { headers } from "./WebContent"
import compareObjects from "../utils/compareObjects";

export default class ValorantAPI {

    client: ValoBot;
    skins_list: any;
    cache: NodeCache;

    constructor(client: ValoBot) {
        this.client = client;
        this.cache = new NodeCache();
        this.skins_list;
    }

    async tempGetShop(bearer:string, entitlements_token:string, user_id:string) {

        const session = axios.create({headers: headers, withCredentials: true});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v2/storefront/${user_id}`, {headers: {Authorization: bearer, "X-Riot-Entitlements-JWT": entitlements_token}}).catch(() => {});
        if(!request) return console.error("Shop GET request failed");
        console.log(request)
        return request.data;
    }

    async getUserShop(user_resolver: riot_user) {
        const session = axios.create({headers: headers, withCredentials: true});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v2/storefront/${user_resolver.id}`, {headers: {Authorization: `Bearer ${user_resolver.access_token}`, "X-Riot-Entitlements-JWT": user_resolver.entitlements_token!}}).catch(console.log);
        if(!request) return;
        var data = request.data;
        var shop: {skins: skin[], bundles: any[]}= {
            skins: [],
            bundles: []
        };
        var skin:string;
        for(let skin_id of data["SkinsPanelLayout"]["SingleItemOffers"]) {
            this.client.log("debug", `Looking for ${skin_id} skin`)
            let skin = await this.getSkin({uuid: skin_id})
            if(skin) shop.skins.push(skin);
        }

        return shop;
    }

    async getSkin(skin_resolver: skin) {
        var skins = await this.getSkins();
        if(!skins) return;
        return skins.find(s => compareObjects(skin_resolver, s));
    }

    async getSkins(ignore_cache = false):Promise<skin[]|undefined> {
        if(!ignore_cache && this.cache.has("skins")) {
            return this.cache.get("skins")
        };
        var request = await axios.get("https://valorant-api.com/v1/weapons/skinlevels").catch();
        var skins:skin[] = request.data["data"];
        this.cache.set("skins", skins);
        return skins;
        console.log(request)
    }


}