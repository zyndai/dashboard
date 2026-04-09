import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const agent = await prisma.agent.findFirst({
    where: { id, userId: user.id },
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  await prisma.agent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
