"use server";

import { createClient } from "@/lib/supabase/server";

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  oldValue: any = null,
  newValue: any = null,
) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return;

  await supabase.from("audit_logs").insert({
    actor_user_id: authData.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue,
    new_value: newValue,
  });
}
