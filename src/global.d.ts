interface db_user {
    id?: string;
    created_at?: any;
    is_dm_sendable?: boolean;
    has_alert?: boolean;
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
    expiry_token?: string;
    entitlements_token?: string;
    cookies?: string;
}

interface dbs {
    test: "test"
}