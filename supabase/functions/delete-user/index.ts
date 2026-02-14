/**
 * ===== EDGE FUNCTION: delete-user =====
 * Xóa tài khoản người dùng khỏi hệ thống.
 *
 * Quyền truy cập:
 * - Admin: xóa bất kỳ user nào (TRỪ admin khác)
 * - User: tự xóa tài khoản của mình
 *
 * Luồng xử lý:
 * 1. Xác thực caller từ Authorization header
 * 2. Kiểm tra quyền (self-delete hoặc admin)
 * 3. Xóa user từ auth.users (dùng service_role key)
 * 4. Dọn dẹp dữ liệu liên quan trong các bảng
 *
 * Body: { target_user_id: string }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the calling user's token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with caller's token to identify them
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { target_user_id } = await req.json();
    if (!target_user_id) {
      return new Response(JSON.stringify({ error: "target_user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const isSelfDelete = caller.id === target_user_id;

    if (!isSelfDelete) {
      // Check if caller is admin
      const { data: callerRoles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id);
      const callerIsAdmin = callerRoles?.some((r: any) => r.role === "admin");
      if (!callerIsAdmin) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if target is admin (cannot delete admins)
      const { data: targetRoles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", target_user_id);
      const targetIsAdmin = targetRoles?.some((r: any) => r.role === "admin");
      if (targetIsAdmin) {
        return new Response(JSON.stringify({ error: "Cannot delete admin accounts" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Delete user from auth (cascades to related tables via FK)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(target_user_id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean up tables that may not have FK cascade
    const tables = ["profiles", "user_roles", "user_hearts", "user_daily_limits", "user_progress", "quiz_attempts", "badges", "feedback", "premium_requests", "reward_redemptions"];
    for (const table of tables) {
      await adminClient.from(table).delete().eq("user_id", target_user_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
