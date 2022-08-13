import axios from "axios"
import ValoBot from "./Client";
import NodeCache from "node-cache"
import { headers, endpoints } from "./WebContent"
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

        
        // TODO: Add time remaining for offers
        var shop: {skins: skin[], bundles: bundle[]}= {
            skins: [],
            bundles: []
        };
        
        var skin:string;
        const skins = data["SkinsPanelLayout"]["SingleItemOffers"];
        const bundles = data["FeaturedBundle"]["Bundles"];

        for(let skin_temp in skins) {
            let skin_id = skins[skin_temp];
            this.client.log("debug", `Looking for ${skin_id} skin`)
            let skin = await this.getSkinAndPrice(user_resolver, {uuid: skin_id});
            if(skin) {
                shop.skins.push(skin);
            }
        }
        shop.skins?.sort((a, b) => b.price! - a.price!);

        for(let bundle_temp of bundles) {
            let bundle_id = bundle_temp["DataAssetID"];
            let currency_id = bundle_temp["CurrencyID"];
            let skins = bundle_temp["Items"];
            var skins_resolver:skin[] =[];
            for(let skin of skins) {
                skins_resolver.push(skin);
            }
            this.client.log("debug", `Looking for ${bundle_id} bundle`)
            let bundle = await this.getBundleAndPrice(user_resolver, {uuid: bundle_id}, skins_resolver);
            
            if(bundle) {   
                bundle.skins?.sort((a, b) => b.price! - a.price!);
                shop.bundles.push(bundle);
            }
        }
        return shop;
    }

    async getSkin(skin_resolver: skin) {
        var skins = await this.getSkins();
        if(!skins) return;
        return skins.find(s => compareObjects(skin_resolver, s));
    }

    async getSkinAndPrice(user_resolver: riot_user, skin_resolver: skin) {
        var skins = await this.getSkins();
        if(!skins) return;
        var skin = skins.find(s => compareObjects(skin_resolver, s));
        if(!skin) return;
        var price = await this.getSkinPrice(user_resolver, skin_resolver.uuid!);
        skin.price = price?.price;
        skin.currency = price?.currency;
        return skin;
    }

    async getBundle(bundle_resolver: bundle) {
        var bundles = await this.getBundles();
        if(!bundles) return;
        var bundle = bundles.find(b => compareObjects(bundle_resolver, b));
        if(!bundle) return;
        bundle.skins = []
        if(bundle_resolver.skins) {
            for(let skin of bundle_resolver.skins) {
                var found_skin = await this.getSkin({uuid: skin.uuid});
                if(found_skin) bundle.skins.push(found_skin);
            }
        }
        return bundle;
    }

    async getBundleAndPrice(user_resolver: riot_user, bundle_resolver: bundle, skins:skin[]) {
        var bundles = await this.getBundles();
        if(!bundles) return;
        var bundle = bundles.find(b => compareObjects(bundle_resolver, b));
        if(!bundle) return;
        bundle.skins = [];
        bundle.items = [];
        bundle.price = 0;
        bundle.discountPrice = 0;
        var price = 0;
        var discount_price = 0;
        if(skins) {
            var skin_temp:any;
            for(skin_temp of skins) {
                let skin = skin_temp["Item"];
                var found_skin = await this.getSkinAndPrice(user_resolver, {uuid: skin["ItemID"]});
                price = parseInt(skin_temp["BasePrice"]);
                if(price) bundle.price = bundle.price + price;
                
                discount_price = parseInt(skin_temp["DiscountedPrice"]);
                if(discount_price) bundle.discountPrice = bundle.discountPrice + discount_price;

                if(found_skin) {
                    if(!bundle.currency) bundle.currency = found_skin.currency;
                    found_skin.price = price;

                    found_skin.discountPrice = discount_price;

                    bundle.skins.push(found_skin);
                }
                else {
                    // this.client.log("debug", skin["ItemID"] + " wasn't a weapon skin");
                    var found_item = await this.getItem({uuid: skin["ItemID"], uuid_type: skin["ItemTypeID"]});
                    
                    if(found_item) {    
                        //@ts-ignore
                        found_item.currency = bundle.currency ?? (await this.getCurrencies())[0];
                        found_item.price = price;
                        found_item.discountPrice = discount_price;
                        bundle.items.push(found_item);
                    }
                }
                
            }
        }
        return bundle;
    }

    async getSkins(ignore_cache = false):Promise<skin[]|undefined> {
        if(!ignore_cache && this.cache.has("skins")) {
            return this.cache.get("skins")
        };
        var request = await axios.get("https://valorant-api.com/v1/weapons/skinlevels").catch();
        if(!request) this.client.log("error", "Cannot fetch valorant skin lists");
        var skins:skin[] = request.data["data"];
        this.client.log("debug", `Fetched ${skins.length} skins`)
        this.cache.set("skins", skins);
        return skins;
    }

    async getBundles(ignore_cache = false):Promise<bundle[]|undefined> {
        if(!ignore_cache && this.cache.has("bundles")) {
            return this.cache.get("bundles")
        };
        var request = await axios.get("https://valorant-api.com/v1/bundles").catch();
        if(!request) this.client.log("error", "Cannot fetch valorant skin lists");
        var bundles:bundle[] = request.data["data"];
        this.cache.set("bundles", bundles);
        return bundles;
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
        return request;
    }

    async getRecentMatchs(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/match-history/v1/history/${user_data.id}?startIndex=0&endIndex=10`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        return request;
    }

    async getName(user_data : riot_user) {
        var body = [user_data.id]
        const session = axios.create({headers: headers});
        var request = await session.put(`https://pd.eu.a.pvp.net/name-service/v2/players`, body, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        return request;
    }

    async getWallet(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v1/wallet/${user_data.id}`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!}}).catch(console.log);
        if(!request) return;
        return request;
    }

    // TODO: Resolve any Valorant items based on UUID type
    async getItem(item_resolver: {uuid: string, uuid_type: string}) {
        const { valorant_api } = endpoints;
        var type = this.getItemType(item_resolver.uuid_type);
        if(!type) return this.client.log("debug", `The fuck is item type of uuid_type ${item_resolver.uuid_type}`);
        //@ts-ignore
        var uri = valorant_api[`link_${type}`];
        if(!uri) return;
        uri = `${uri}/${item_resolver.uuid}?${valorant_api.parameters.all_languages}`;

        const session = axios.create({headers: headers});
        var request = await session.get(uri).catch(() => console.log(`Cannot find item type ${type} with uuid ${item_resolver.uuid}`))
        if(!request) return;
        var item:base_item = request.data.data
        return item;

    }

    getItemType(uuid_type: string) {
        return item_ids[uuid_type];
    }

    async getRank(user_data : riot_user) {
        const session = axios.create({headers: headers});
        var request = await session.get(`https://shared.eu.a.pvp.net/content-service/v2/content`, {headers: {Authorization: `Bearer ${user_data.access_token}`, "X-Riot-Entitlements-JWT": user_data.entitlements_token!, "X-Riot-ClientVersion": "release-05.03-shipping-8-745499"}}).catch(console.log);
        if(!request) return;
        console.log(request.data);
        return request;
    }
}

const item_ids:any = {
    "e7c63390-eda7-46e0-bb7a-a6abdacd2433": "skin_level",
    "3ad1b2b2-acdb-4524-852f-954a76ddae0a": "skin_chroma",
    "01bb38e1-da47-4e6a-9b3d-945fe4655707": "agent",
    "f85cb6f7-33e5-4dc8-b609-ec7212301948": "contract_definition",
    "dd3bf334-87f3-40bd-b043-682a57a8dc3a": "buddy",
    "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475": "spray",
    "3f296c07-64c3-494c-923b-fe692a4fa1bd": "player_card",
    "de7caa6b-adf7-4588-bbd1-143831e786c6": "player_title"
  }