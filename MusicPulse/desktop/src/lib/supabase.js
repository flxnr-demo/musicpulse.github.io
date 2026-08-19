import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://doearrsajrfzlqsbrryt.supabase.co";

const supabaseKey =
  "sb_publishable_DwxG0zK_VZRvC8S-dcw7xQ_C1fXujae";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);