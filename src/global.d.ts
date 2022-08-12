interface db_user {
    id?: string;
    created_at?: any;
    is_dm_sendable?: boolean;
    has_alert?: boolean;
    cookies?: string;
}

interface db_riot_user {
    id?: string;
    created_at?: any;
    user_id?: string;
    username?: string;
    tag?: string;
    skin_alerts?: string[];
    bundle_alerts?: string[];
    access_token?: string;
    token_id?: string;
    region?: string;
    ssid?: string;
    expiry_token?: number;
    entitlements_token?: string;
    cookies?: string;
}

interface user {
    id: string;
    created_at: string;
    is_dm_sendable: boolean;
    has_alert: boolean;
    riot_users: any[];
    cookies?: string;
}

interface riot_user {
    id: string;
    created_at: any;
    user_id: string;
    username?: string;
    tag?: string;
    skin_alerts?: string[];
    bundle_alerts?: string[];
    access_token: string;
    token_id: string;
    region?: string;
    ssid: string;
    expiry_token: number;
    entitlements_token: string;
    cookies?: string;
}

interface skin {
    uuid?: string
    displayName?: string
    themeUuid?: string
    contentTierUuid?: string
    displayIcon?: string
    wallpaper?: string
    assetPath?: string
    chromas?: {}[]
    levels?: {}[]
    price?: number
    currency?: currency;
}

interface riot_user_info {
    country: string
    sub: string
    email_verified: boolean,
    player_plocale: string,
    country_at: string //?
    pw: any
    phone_number_verified: boolean
    account_verified: boolean
    ppid: any // ?
    player_locale: string 
    acct: acct
    age: number
    jti: string
    affinity: any
}

interface acct {
    type: number
    state: string
    adm: boolean
    game_name: string
    tag_line: string
    created_at: number
}

interface currency {
    uuid?: string
    displayName?: string
    displayNameSingular?: string
    displayIcon?: string
    largeIcon?: string
}

interface uuid_resolver {
    uuid: string
}