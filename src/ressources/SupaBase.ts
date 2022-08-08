
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from 'discord.js';
import ValoBot from './Client';

const supabaseUrl = 'https://hezbdncmoixrjvgvlcjt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default class SupaBase {
    supabase: SupabaseClient;
    client?: ValoBot;
    constructor(client?: ValoBot) {
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

    async createUser(user_data: db_user&{id:string}, user_riot_data: db_riot_user) {
        console.log(await this.getUser(user_data))
        if(!(await this.getUser(user_data))) {
            var { data, error } = await supabase
                .from('users')
                .insert(
                    user_data 
                )
            if(error) return this.client?.log("db", error);
        }
        var output_data: {user: db_user, riot_users?: db_riot_user} = {
            //@ts-ignore
            user: data
        }
        var { data, error } = await supabase
            .from('riot_users')
            .insert(
             user_riot_data 
        )
        if(error || !data) return this.client?.log("db", error);

        //@ts-ignore
        output_data.riot_accounts = data;
        this.client?.log("user", `Register ${user_data.id} for riot account ${user_riot_data.id} (${user_riot_data.username}${user_riot_data.tag})`)
        return output_data;
    }

    async getUser(user_resolver: db_user&{id:string}, lite:boolean = false) {
        var { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_resolver.id)
        if(error || !data) return this.client?.log("db", error);

        var output_data: {user: db_user, riot_users?: db_riot_user} = {
            //@ts-ignore
            user: data,
        }

        if(lite) return output_data;
        var { data, error } = await supabase
            .from('riot_users')
            .select('*')
            .eq('user_id', user_resolver.id)
        if(error || !data) return this.client?.log("db", error);

        //@ts-ignore
        output_data.riot_users = data;
        return output_data;

    }
}