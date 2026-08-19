import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
    "https://doearrsajrfzlqsbrryt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_DwxG0zK_VZRvC8S-dcw7xQ_C1fXujae";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);