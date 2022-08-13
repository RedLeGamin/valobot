export const headers = {
    'User-Agent': 'RiotClient/51.0.0.4429735.4381201 rso-auth (Windows;10;;Professional, x64)',
    'Content-Type': 'application/json',
    'Accept': '*/*'
}

export const endpoints = {
    main: {
        link: "https://auth.riotgames.com",
        route: "/"
    },
    authorization: {
        link: "https://auth.riotgames.com/api/v1/authorization",
        link_cookies: "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1",
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
            },
            put_2f: {
                "type": "multifactor",
                "code": "{code}",
                "rememberDevice": true
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
                "Authorization": "Bearer {access_token}"
            }
        }
    },
    valorant_api: {
        skin_level: "https://valorant-api.com/v1/weapons/skinlevels",
        link_skin_chroma: "https://valorant-api.com/v1/weapons/skinchromas",
        link_agent: "https://valorant-api.com/v1/agents",
        link_contract: "https://valorant-api.com/v1/contracts",
        link_buddy: "https://valorant-api.com/v1/buddies/levels",
        link_spray: "https://valorant-api.com/v1/sprays",
        link_player_card: "https://valorant-api.com/v1/playercards",
        link_player_title: "https://valorant-api.com/v1/playertitles",
        parameters: {
            all_languages: "language=all",
            specific_language: "language={language}"
        }
    }
}

