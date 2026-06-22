import { Router } from "express";
import { supabase, getSupabase } from "../lib/supabase.js";

const router = Router();

// GET /api/v1/messages - Retrieve message board items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await getSupabase(req).from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const mapped = (data || []).map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      message: m.message,
      date: new Date(m.created_at).getTime(),
      customerId: m.customer_id || (m.phone === "SYSTEM" ? "00000000-0000-0000-0000-000000000000" : null),
      adminReply: m.admin_reply,
      isRead: m.is_read
    }));

    res.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("GET /api/v1/messages error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/messages - Submit or reply to a customer session message
router.post("/", async (req, res) => {
  try {
    const msg = req.body;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetCustomerId = (msg.customerId && uuidRegex.test(msg.customerId)) ? msg.customerId : null;
    if (targetCustomerId === "00000000-0000-0000-0000-000000000000") {
      targetCustomerId = null;
    }

    const isReadVal = msg.isRead !== undefined ? msg.isRead : (msg.is_read !== undefined ? msg.is_read : false);
    const payload = {
      name: msg.name,
      phone: msg.phone,
      message: msg.message,
      customer_id: targetCustomerId,
      admin_reply: msg.adminReply || null,
      is_read: isReadVal,
      legacy_id: msg.id
    };

    let result;
    let existingMsg = null;

    if (msg.id) {
      if (uuidRegex.test(msg.id)) {
        const { data } = await getSupabase(req).from('messages').select('id').eq('id', msg.id).maybeSingle();
        if (data) existingMsg = data;
      } else {
        const { data } = await getSupabase(req).from('messages').select('id').eq('legacy_id', msg.id).maybeSingle();
        if (data) existingMsg = data;
      }
    }

    if (existingMsg) {
      result = await getSupabase(req).from('messages').update(payload).eq('id', existingMsg.id);
    } else {
      result = await getSupabase(req).from('messages').insert([payload]);
    }

    if (result.error) throw result.error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/v1/messages error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/messages/:id - Erase chat log ticket from database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await getSupabase(req).from('messages').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/v1/messages/:id error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
