import axios from "axios"
import ValoBot from "./Client";
import { headers, endpoints } from "./WebContent";

export default class RiotAuth {

    client: ValoBot;

    constructor(client: ValoBot) {
        this.client = client;
    }

    async authenticate(credentials: {password: string, username: string}) {

        var header = headers;
        var { authorization, entitlements, userinfo } = endpoints;

        const session = axios.create({headers: header, withCredentials: true});

        var body:any = endpoints.authorization.bodys.post;

        var request:any = await session.post(authorization.link, body).catch((e) => {});
        if(!request) return console.error(`Auth POST request failed ${authorization.link}`);

        var cookies:string[] = request.headers["set-cookie"];
        var cookies_text = cookies.join("; ");

        body = authorization.bodys.put;
        body.username = credentials.username;
        body.password = credentials.password;

        request = await session.put(authorization.link, body, {headers: {Cookie: cookies_text}}).catch(() => {});
        if(!request) return console.error(`Auth PUT request failed ${authorization.link}`);

        var security_type = request.data['type'];

        if(security_type == "multifactor") {
            return this.client.log("error", "2FA Activated, pls, red fix");
        }

        else if (security_type == "response") {
            var uri = request.data['response']['parameters']['uri'];

            var access_token = uri.match(/access_token=([^&]+)/)[1];
            var id_token = uri.match(/id_token=([^&]+)/)[1];
            var expires_in = uri.match(/expires_in=([^&]+)/)[1];
            var bearer = `Bearer ${access_token}`
        
            request = await session.post(entitlements.link, {}, {headers: {Authorization: bearer}}).catch(() => {});
            if(!request) return console.error(`Auth POST request failed ${entitlements.link}`);
        
            var entitlements_token = request.data['entitlements_token'];
        
            request = await session.post(userinfo.link, {}, {headers: {Authorization: bearer}}).catch(() => {});
            if(!request) return console.error(`Auth POST request failed ${userinfo.link}`);
        
            var user_id = request.data["sub"]

        }
        else return this.client.log("important", `Unknown security type has been detected while login : ${security_type}`);

        const data: {security_type: string, user_data: db_user, riot_data: db_riot_user} = {
            security_type: security_type,
            user_data: {
            },
            riot_data: {
                id: user_id,
                token_id: id_token,
                access_token: access_token,
                expiry_token: expires_in,
                entitlements_token: entitlements_token,
                cookies: cookies_text
            }
        };
        return data;
    }

    async authenticate2FA () {
        
    }
}
