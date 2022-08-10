
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import User from './User';
import ValoBot from './Client';

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
        let { data: users, error } = await supabase
            .from('users')
            .select('id')
        if(error) return this.client?.log("db", error);
        return users?.length;
    }

    async createUser(user_data: db_user&{id:string}) {
        if(!(await this.getUser(user_data))) {
            var { data, error } = await supabase
                .from('users')
                .insert(
                    user_data 
                )
            if(error) return this.client?.log("db", error);
        }
        //this.client?.log("user", `Register ${user_data.id} for riot account ${user_riot_data.id} (${user_riot_data.username}${user_riot_data.tag})`)
        return data;
    }

    async createRiotUser(user_riot_data: db_riot_user&{user_id:string}) {
        var { data, error } = await supabase
            .from('riot_users')
            .insert(
             user_riot_data 
        )
        if(error || !data) return this.client?.log("db", error);
    }

    async getUser(user_resolver: db_user&{id:string}, lite:boolean = false) {
        var { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_resolver.id)
        if(error || !data || data.length == 0) return this.client?.log("db", error);

        var output_data: user = data[0];

        if(lite) return new User(this.client, output_data);
        var { data, error } = await supabase
            .from('riot_users')
            .select('*')
            .eq('user_id', user_resolver.id)
        if(error || !data) return this.client?.log("db", error);

        //@ts-ignore
        output_data.riot_users = data;
        return new User(this.client, output_data);
    }


    async getRiotAccount(user_resolver: db_riot_user&{id:string}) {
        var { data, error } = await supabase
            .from('riot_users')
            .select('*')
            .eq('id', user_resolver.id)
        if(error || !data) return this.client?.log("db", error);

        //@ts-ignore
        return data;
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