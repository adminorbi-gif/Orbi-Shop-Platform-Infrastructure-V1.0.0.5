import { supabase } from './server/lib/supabase.js';
console.log(supabase.from('orders').delete().eq('id', undefined).url.toString());
console.log(supabase.from('orders').delete().eq('id', 'undefined').url.toString());
console.log(supabase.from('orders').delete().eq('id', 'my-id').url.toString());
