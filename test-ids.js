import { supabase } from './server/lib/supabase.js';

async function check() {
  const { data } = await supabase.from('orders').select('id, legacy_id, status');
  console.log("Orders count:", data?.length);
  console.log("Unique IDs count:", new Set(data?.map(o => o.id)).size);
  console.log("Orders with undefined ID:", data?.filter(o => !o.id).length);
}
check();
