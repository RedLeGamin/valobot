import axios, { AxiosError, AxiosResponse } from "axios"
import ValoBot from "./Client";
import { headers, endpoints } from "./WebContent";

export default class RiotAuth {

    client: ValoBot;

    constructor(client: ValoBot) {
        this.client = client;
    }

    async init_cookies() {
        var { authorization } = endpoints;
        const session = axios.create({headers: headers, withCredentials: true});

        var body:any = endpoints.authorization.bodys.post;

        var request:any = await session.post(authorization.link, body).catch((e) => {});
        if(!request) return console.error(`Auth POST request failed ${authorization.link}`);
        return request.headers["set-cookie"].join("; ");
    }

    async authenticate(credentials: {password: string, username: string}, cookies?:string) {

        var { authorization, entitlements, userinfo } = endpoints;

        const session = axios.create({headers: headers, withCredentials: true});

        var body:any = endpoints.authorization.bodys.post;
        
        if(!cookies) cookies = await this.init_cookies();
        if(!cookies) return this.client.log("error", "Cannot init cookies for authentification");

        body = authorization.bodys.put;
        body.username = credentials.username;
        body.password = credentials.password;

        var request = await session.put(authorization.link, body, {headers: {Cookie: cookies}}).catch(() => {});
        if(!request) return console.error(`Auth PUT request failed ${authorization.link}`);

        var security_type = request.data['type'];

        if(security_type == "multifactor") {
            this.client.log("debug", request.data);
            // this.client.global.web_sessions[];
            //@ts-ignore
            var temp_cookies:[] = request.headers["set-cookie"];
            temp_cookies?.shift();
            cookies = temp_cookies?.join("; ")
            const multifactor = request.data['multifactor'];
            const data: {security_type: "multifactor", email:string, cookies: string} = {
                security_type: security_type,
                email: multifactor.email,
                cookies: cookies
            }
            return data;
        }

        else if (security_type == "response") {
            var uri = request.data['response']['parameters']['uri'];

            var access_token = uri.match(/access_token=([^&]+)/)[1];
            var id_token = uri.match(/id_token=([^&]+)/)[1];
            var expires_in = parseInt(uri.match(/expires_in=([^&]+)/)[1])*1000 + Date.now();
            var bearer = `Bearer ${access_token}`
            //@ts-ignore
            cookies = request.headers["set-cookie"].join("; ");
        
            var entitlements_token = await this.getEntitlementsToken(access_token);
            if(!entitlements_token) return;
            
            var user_info = await this.getUserInfo(access_token);
            if(!user_info) return;
            var user_id = user_info.sub;
            var acct = user_info.acct ?? {};
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
                cookies: cookies,
                tag: acct.tag_line,
                username: acct.game_name,
                region: user_info.country,
            }
        };
        return data;
    }

    async authenticate2FA (code: string, cookies?: string) {

        var { authorization, entitlements, userinfo } = endpoints;

        var session = axios.create({headers: headers, withCredentials: true});

        var body: any = authorization.bodys.put_2f;
        body.code = code;

        if(!cookies) cookies = await this.init_cookies();
        if(!cookies) return this.client.log("error", "Cannot init cookies for 2F authentification");

        // TODO: Fix request fail
        var request = await session.put(authorization.link, body, {headers: {Cookie: cookies}}).catch(console.log);
        if(!request) return console.error(`Auth PUT request failed ${authorization.link}`);
        
        var security_type = request.data['type'];

        if (security_type == "response") {
            var uri = request.data['response']['parameters']['uri'];

            var access_token = uri.match(/access_token=([^&]+)/)[1];
            var id_token = uri.match(/id_token=([^&]+)/)[1];
            var expires_in = parseInt(uri.match(/expires_in=([^&]+)/)[1])*1000 + Date.now();
            var bearer = `Bearer ${access_token}`
            //@ts-ignore
            cookies = request.headers["set-cookie"].join("; ");
        
            var entitlements_token = await this.getEntitlementsToken(access_token);
            if(!entitlements_token) return;
            
            var user_info = await this.getUserInfo(access_token);
            if(!user_info) return;
            var user_id = user_info.sub;
            var acct = user_info.acct ?? {};
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
                cookies: cookies,
                tag: acct.tag_line,
                username: acct.game_name,
                region: user_info.country,
            }
        };
        return data;
    }

    async getUserInfo(access_token:string) {
        const { userinfo } = endpoints;
        var session = axios.create({headers: headers, withCredentials: true, maxRedirects: 0});

        var request = await session.post(userinfo.link, {} ,{headers: {Authorization: `Bearer ${access_token}`}}).catch(console.log);
        if(!request) return this.client.log("error", `Auth POST request failed : Cannot fetch user info`);
        var riot_user_info:riot_user_info = request.data;
        return riot_user_info;
    }

    async getEntitlementsToken(access_token: string) {
        const { entitlements } = endpoints;
        var session = axios.create({headers: headers, withCredentials: true, maxRedirects: 0});

        var request = await session.post(entitlements.link, {} ,{headers: {Authorization: `Bearer ${access_token}`}}).catch(console.log);
        if(!request) return this.client.log("error", `Auth POST request failed : Cannot fetch entitlements token`);
        var entitlements_token:string = request.data["entitlements_token"];
        return entitlements_token;
    }

    async refresh_token(cookies: string) {

        var { authorization } = endpoints;

        var session = axios.create({headers: headers, withCredentials: true, maxRedirects: 0});
        
        // 303 Code error & redirection to https://playvalorant.com/opt_in is a good request
        // Else, cookies have expired

        var request:AxiosError = await session.get(authorization.link_cookies, {headers: {Cookie: cookies}}).catch((r) => r);  
        

        var code = request.response?.status;
        var uri:any = request.response!.headers["location"];
        if(uri == null) return this.client.log("debug", "Failed to refresh token (no valid redirection)");
        if(code != 303) return this.client.log("debug", `Failed to refresh token (error code ${code})`);
        if(uri.includes("/login")) return this.client.log("debug", 'Failed to refresh token (/login redirection)');
        var data = request.response?.data;


        cookies = request.response!.headers["set-cookie"]!.join("; ")
        var access_token = uri.match(/access_token=([^&]+)/)[1];
        var id_token = uri.match(/id_token=([^&]+)/)[1];
        var expires_in = parseInt(uri.match(/expires_in=([^&]+)/)[1])*1000 + Date.now();

        return {
            access_token: access_token,
            id_token: id_token,
            expires_in: expires_in,
            cookies: cookies
        }
    }
}
