
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import User from './User';
import ValoBot from './Client';
import RiotUser from './RiotUser';

const supabaseUrl = 'https://hezbdncmoixrjvgvlcjt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default class SupaBase {
    supabase: SupabaseClient;
    client: ValoBot;
    constructor(client: ValoBot) {
        this.client = client;
        this.supabase = supabase;
    }

    async fetchUserSize() {        
        let { data, error } = await supabase
            .from('users')
            .select('id')
        if(error || !data) return this.client?.log("db", error);
        return data.length;
    }

    async createUser(user_data: db_user&{id:string}) {
        if((await this.getUser(user_data))) return this.updateUser(user_data.id, user_data)

        var { data, error } = await supabase
            .from('users')
            .insert(
                user_data 
            )
        if(error || !data) return this.client?.log("db", error);
        //this.client?.log("user", `Register ${user_data.id} for riot account ${user_riot_data.id} (${user_riot_data.username}${user_riot_data.tag})`)
        return new User(this.client, data[0]);
    }

    async createRiotUser(user_riot_data: db_riot_user&{user_id:string}) {
        if(await this.getRiotAccount({id: user_riot_data.id!})) return this.updateUser(user_riot_data.id!, user_riot_data)
        var { data, error } = await supabase
            .from('riot_users')
            .insert(
             user_riot_data 
        )
        if(error || !data) return this.client?.log("db", error);
        
        return new RiotUser(this.client, data[0]);
    }

    async getUser(user_resolver: db_user&{id:string}, lite:boolean = false) {
        var { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_resolver.id)
        if(error || !data || !data.length) return;

        var output_data: user = data[0];

        if(lite) return new User(this.client, output_data);
        var { data, error } = await supabase
            .from('riot_users')
            .select('*')
            .eq('user_id', user_resolver.id)
        // if(error) return; ?
        output_data.riot_users = data ?? [];

        //@ts-ignore
        return new User(this.client, output_data);
    }


    async getRiotAccount(user_resolver: db_riot_user&{id:string}) {
        var { data, error } = await supabase
            .from('riot_users')
            .select('*')
            .eq('id', user_resolver.id)
        if(error || !data || !data.length) return;

        return new RiotUser(this.client, data[0]);
    }

    async updateUser(user_id: string, user_data: db_user) {
        return await supabase
            .from('users')
            .update(user_data)
            .eq("id", user_id)
    }

    async updateRiotAccount(user_id: string, user_data: db_riot_user) {
        return await supabase
            .from('riot_users')
            .update(user_data)
            .eq("id", user_id)
    }
}