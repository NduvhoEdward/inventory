import { isOwner } from "../../../lib/auth";
import { getInventory } from "../../../lib/storage";
import { workspaceBackup, workspaceCsv } from "../../../lib/workspace.mjs";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (!["json", "csv"].includes(format))
    return Response.json({ error: "Choose JSON or CSV." }, { status: 400 });
  try {
    if (!(await isOwner()))
      return Response.json(
        { error: "Unlock to download backups." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    const backup = workspaceBackup(await getInventory());
    const text =
      format === "json"
        ? JSON.stringify(backup, null, 2)
        : workspaceCsv(backup);
    return new Response(text, {
      headers: {
        "Content-Type":
          format === "json"
            ? "application/json; charset=utf-8"
            : "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bench-inventory-${backup.exportedAt.slice(0, 10)}.${format}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Could not create a backup. Your saved inventory has not changed.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
