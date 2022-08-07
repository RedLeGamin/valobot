import axios from "axios"
import ValoBot from "./Client";

export default class ValorantAPI {

    client: ValoBot;

    constructor(client: ValoBot) {
        this.client = client;
    }

    async tempGetShop(bearer:string, entitlements_token:string, user_id:string) {

        var headers = {
            'User-Agent': 'RiotClient/51.0.0.4429735.4381201 rso-auth (Windows;10;;Professional, x64)',
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }

        const session = axios.create({headers: headers, withCredentials: true});
        var request = await session.get(`https://pd.eu.a.pvp.net/store/v2/storefront/${user_id}`, {headers: {Authorization: bearer, "X-Riot-Entitlements-JWT": entitlements_token}}).catch(() => {});
        if(!request) return console.error("Shop GET request failed");
        console.log(request)
        return request.data;
    }

    getShop(user: any) {

    }
}