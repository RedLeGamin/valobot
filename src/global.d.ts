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
    riot_users: riot_user[];
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
}