export const headers = {
    'User-Agent': 'RiotClient/51.0.0.4429735.4381201 rso-auth (Windows;10;;Professional, x64)',
    'Content-Type': 'application/json',
    'Accept': '*/*'
}

export const endpoints = {
    main: {
        "link": "https://auth.riotgames.com",
        "route": "/"
    },
    authorization: {
        link: "https://auth.riotgames.com/api/v1/authorization",
        route: "/api/v1/authorization",
        bodys: {
            post: {
                "client_id": "play-valorant-web-prod",
                "nonce": "1",
                "redirect_uri": "https://playvalorant.com/opt_in",
                "response_type": "token id_token",
            },
            put: {
                "language": "en_US",
                "region": null,
                "remember": true,
                "type": "auth",
                "username": "{username}",
                "password": "{password}"
            }
        }
    },
    entitlements: {
        link: "https://entitlements.auth.riotgames.com/api/token/v1",
        route: "/api/token/v1",
        bodys: {
            post: {
                "Authorization": "{bearer}"
            }
        }
    },
    userinfo: {
        link: "https://auth.riotgames.com/userinfo",
        route: "/userinfo",
        bodys: {
            post: {
                "Authorization": "{bearer}"
            }
        }
        
    }
}