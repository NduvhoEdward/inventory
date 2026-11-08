import { getParts, saveParts } from "../../../lib/storage";
import { validateParts } from "../../../lib/inventory.mjs";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const parts = validateParts(await getParts());
    return Response.json({ parts }, { headers });
  } catch {
    return Response.json(
      { error: "Could not load your inventory. Please try again." },
      { status: 503, headers },
    );
  }
}

export async function POST(request) {
  let parts;
  try {
    const body = await request.json();
    parts = validateParts(body.parts);
  } catch {
    return Response.json(
      { error: "Invalid inventory data." },
      { status: 400, headers },
    );
  }
  try {
    await saveParts(parts);
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    if (error.needsUpgrade)
      return Response.json(
        { error: "Refresh the app to use collections." },
        { status: 409, headers },
      );
    return Response.json(
      { error: "Could not save your inventory. Please try again." },
      { status: 503, headers },
    );
  }
}
