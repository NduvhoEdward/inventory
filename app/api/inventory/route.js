import { isOwner, sameOrigin } from "../../../lib/auth";
import { publicInventory } from "../../../lib/privacy.mjs";
import { getInventory, saveInventory } from "../../../lib/storage";
import { validateInventory } from "../../../lib/workspace.mjs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  try {
    const owner = await isOwner();
    const data = await getInventory();
    return Response.json(
      { ...(owner ? data : publicInventory(data)), owner },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Could not load your inventory. Please try again." },
      { status: 503, headers },
    );
  }
}
export async function POST(request) {
  try {
    if (!sameOrigin(request) || !(await isOwner()))
      return Response.json(
        { error: "Unlock to edit your inventory." },
        { status: 403, headers },
      );
  } catch {
    return Response.json(
      { error: "Authentication unavailable." },
      { status: 503, headers },
    );
  }
  let data;
  try {
    data = await request.json();
    validateInventory(data);
    if (!Number.isSafeInteger(data.revision) || data.revision < 0)
      throw new Error();
  } catch {
    return Response.json(
      { error: "Invalid inventory data." },
      { status: 400, headers },
    );
  }
  try {
    return Response.json(
      { revision: await saveInventory(data, data.revision) },
      { headers },
    );
  } catch (e) {
    return Response.json(
      {
        error: e.conflict
          ? "Your inventory changed in another session. Reload the page before saving."
          : "Could not save your change. Please try again.",
      },
      { status: e.conflict ? 409 : 503, headers },
    );
  }
}
