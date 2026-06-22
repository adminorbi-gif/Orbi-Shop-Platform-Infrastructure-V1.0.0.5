import { supabase } from './server/lib/supabase.js';

async function check() {
  const { data: firstOrder } = await supabase.from('orders').select('id, legacy_id, status').limit(2);
  console.log("Will delete:", firstOrder?.[0]?.id);
  
  const { error } = await supabase.from('orders').delete().eq('id', firstOrder?.[0]?.id);
  console.log("Delete error:", error);
  
  const { data: remaining } = await supabase.from('orders').select('id');
  console.log("Remaining orders count:", remaining?.length);
  console.log("Was it deleted?", remaining.find(o => o.id === firstOrder?.[0]?.id) ? "No" : "Yes");
}
check();
