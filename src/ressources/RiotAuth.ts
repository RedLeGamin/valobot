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
        if(!request) return console.error("Auth POST request failed");

        var cookies:string[] = request.headers["set-cookie"];
        var cookiesText = cookies.join("; ");

        body = authorization.bodys.put;
        body.username = credentials.username;
        body.password = credentials.password;

        request = await session.put(authorization.link, body, {headers: {Cookie: cookiesText}}).catch(() => {});
        if(!request) return console.error("Auth PUT request failed");

        var security_type = request.data['type'];

        if(security_type == "multifactor") {
            console.error("2FA Activated, pls, red fix");
        }

        else if (security_type == "response") {
            var uri = request.data['response']['parameters']['uri'];

            var access_token = uri.match(/access_token=([^&]+)/)[1];
            var id_token = uri.match(/id_token=([^&]+)/)[1];
            var expires_in = uri.match(/expires_in=([^&]+)/)[1];
            var bearer = `Bearer ${access_token}`
        
            request = await session.post(entitlements.link, {}, {headers: {Authorization: bearer}}).catch(() => {});
            if(!request) return console.error("Auth POST request failed");
        
            var entitlements_token = request.data['entitlements_token'];
        
            request = await session.post(userinfo.link, {}, {headers: {Authorization: bearer}}).catch(() => {});
            if(!request) return console.error("Auth POST request failed");
        
            var user_id = request.data["sub"]
            this.client.log("debug", "Logged user " + user_id)
        }
        else return this.client.log("important", `Unknown security type has been detected while login : ${security_type}`);
        return security_type;
    }

    async authenticate2FA () {
        
    }
}
