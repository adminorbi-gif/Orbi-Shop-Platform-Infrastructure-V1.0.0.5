import { supabase } from './server/lib/supabase.js';

async function check() {
  const { data: firstOrder } = await supabase.from('orders').select('id, legacy_id, status').limit(1).single();
  console.log("Will delete:", firstOrder.id);
  
  const { error } = await supabase.from('orders').delete().eq('id', firstOrder.id);
  console.log("Delete error:", error);
  
  const { data: remaining } = await supabase.from('orders').select('id');
  console.log("Remaining orders count:", remaining?.length);
}
check();
