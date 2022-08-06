import axios from "axios"


export default async function auth(credentials: {password: string, username: string}) {

    var headers = {
        'User-Agent': 'RiotClient/51.0.0.4429735.4381201 rso-auth (Windows;10;;Professional, x64)',
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }

    const session = axios.create({headers: headers, withCredentials: true});

    var body:any = {
        "client_id": "play-valorant-web-prod",
        "nonce": "1",
        "redirect_uri": "https://playvalorant.com/opt_in",
        "response_type": "token id_token",
    }

    var request:any = await session.post("https://auth.riotgames.com/api/v1/authorization", body).catch(() => {});
    if(!request) return console.error("Auth POST request failed");

    var cookies:string[] = request.headers["set-cookie"];
    var cookiesText = cookies.join("; ");

    body = {
        "language": "en_US",
        "password": credentials.password,
        "region": null,
        "remember": true,
        "type": "auth",
        "username": credentials.username
    }

    request = await session.put("https://auth.riotgames.com/api/v1/authorization", body, {headers: {Cookie: cookiesText}}).catch(() => {});
    if(!request) return console.error("Auth PUT request failed");

    var security_type = request.data['type'];

    if(security_type == "multifactor") {
        return console.error("2FA Activated, pls, red fix");
    }

    else if (security_type == "response") {
        var uri = request.data['response']['parameters']['uri'];

        var access_token = uri.match(/access_token=([^&]+)/)[1];
        var id_token = uri.match(/id_token=([^&]+)/)[1];
        var expires_in = uri.match(/expires_in=([^&]+)/)[1];
        var bearer = `Bearer ${access_token}`
    
        request = await session.post("https://entitlements.auth.riotgames.com/api/token/v1", {}, {headers: {Authorization: bearer}}).catch(() => {});
        if(!request) return console.error("Auth POST request failed");
    
        var entitlements_token = request.data['entitlements_token'];
    
        request = await session.post("https://auth.riotgames.com/userinfo", {}, {headers: {Authorization: bearer}}).catch(() => {});
        if(!request) return console.error("Auth POST request failed");
    
        var user_id = request.data["sub"]
        console.log("Logged user " + user_id)
    
        request = await session.get(`https://pd.eu.a.pvp.net/store/v2/storefront/${user_id}`, {headers: {Authorization: bearer, "X-Riot-Entitlements-JWT": entitlements_token}}).catch(() => {});
        if(!request) return console.error("Auth POST request failed");
    
        return console.log(request.data)
    }

    else return;
}