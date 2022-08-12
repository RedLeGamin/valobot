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
        const skins = data["SkinsPanelLayout"]["SingleItemOffers"];
        for(let skin_temp in skins) {
            let skin_id = skins[skin_temp];
            let currency_id = skin_temp;
            this.client.log("debug", `Looking for ${skin_id} skin`)
            let skin = await this.getSkin({uuid: skin_id})
            let price = await this.getSkinPrice(user_resolver, skin_id);
            
            if(skin) {
                if(price) {
                    skin.price = price.price;
                    skin.currency = price.currency;
                }
                shop.skins.push(skin);
            }
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
        if(!request) this.client.log("error", "Cannot fetch valorant skin lists");
        var skins:skin[] = request.data["data"];
        this.cache.set("skins", skins);
        return skins;
    }

    async getCurrency(currency_resolver: currency) {
        var currencies = await this.getCurrencies();
        if(!currencies) return;
        return currencies.find(c => compareObjects(currency_resolver, c));
    }

    async getCurrencies(ignore_cache = false):Promise<currency[]|undefined> {
        const CACHE_ID = "currencies";
        if(!ignore_cache && this.cache.has(CACHE_ID)) {
            return this.cache.get(CACHE_ID)
        };
        var request = await axios.get("https://valorant-api.com/v1/currencies").catch();
        if(!request) this.client.log("error", "Cannot fetch valorant skin lists");
        var currencies:currency[] = request.data["data"];
        this.cache.set(CACHE_ID, currencies);
        return currencies;
    }

    async getSkinPrice(user_data: riot_user, skin_id: string, ignore_cache = false) {
        var skin_prices = await this.getSkinMetaData(user_data, ignore_cache);
        if(!skin_prices) return;
        var price = skin_prices.find(s => skin_id == s.OfferID);
        if(!price) return;
        price = price["Cost"];
        var currency_id = Object.keys(price)[0];
        var currency = await this.getCurrency({uuid: currency_id})
        if(!currency) return;
        var price_currency:{price: number, currency: currency} = {
            price: price[currency_id],
            currency: currency
        } 
        return price_currency;
    }


    async getSkinMetaData(user_data: riot_user, ignore_cache = false):Promise<any[] | undefined> {
        const CACHE_ID = "skin_meta_data";
        if(!ignore_cache && this.cache.has(CACHE_ID)) {
            return this.cache.get(CACHE_ID);
        };
        const session = axios.create({headers: headers, withCredentials: true});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v1/offers/`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        var data:any[] = request.data["Offers"];
        this.cache.set(CACHE_ID, data);

        return data;
    }

    async getInventory(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/personalization/v2/players/${user_data.id}/playerloadout`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }

    async getRecentMatchs(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/match-history/v1/history/${user_data.id}?startIndex=0&endIndex=10`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }

    async getName(user_data : riot_user) {
        var body = [user_data.id]
        const session = axios.create({headers: headers});
        var request = await session.put(`https://pd.eu.a.pvp.net/name-service/v2/players`, body, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }

    async getWallet(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v1/wallet/${user_data.id}`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }


    async getRank(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/contract-definitions/v2/definitions/story`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }
}