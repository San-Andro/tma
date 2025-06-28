import { createClient } from '@supabase/supabase-js';
import { load } from "https://deno.land/std@0.200.0/dotenv/mod.ts";

const env = await load({
    envPath: `../../.env`,
    export: true
})

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_KEY")!,
);

export default supabase;

// тут я просто создал клинта, файл с запросами в бд я удалил, но в бд пользователь создан









