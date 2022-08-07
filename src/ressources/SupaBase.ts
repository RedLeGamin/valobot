
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from 'discord.js';
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
        this.client.log("db", error);
        return users?.length;
    }

    async createUser(user_data: user_data) { // TODO: remove any
        const { data, error } = await supabase
            .from('users')
            .insert(
             user_data 
        )
        console.log(error)
    }
}