import { getInventory } from "../../../lib/storage";
import { publicInventory } from "../../../lib/privacy.mjs";
import { isOwner } from "../../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const owner = await isOwner(),
      data = await getInventory();
    return Response.json(
      { parts: (owner ? data : publicInventory(data)).parts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Inventory unavailable." }, { status: 503 });
  }
}
export async function POST() {
  return Response.json(
    { error: "Refresh the app and unlock to edit." },
    { status: 403 },
  );
}
