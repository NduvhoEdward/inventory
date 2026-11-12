import {
  sameOrigin,
  allowedAttempt,
  setup,
  login,
  logout,
} from "../../../lib/auth";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  try {
    if (Number(request.headers.get("content-length") || 0) > 4096)
      return Response.json(
        { error: "Request too large." },
        { status: 413, headers },
      );
    const body = await request.json();
    if (body.action === "logout") {
      await logout();
      return Response.json({ ok: true }, { headers });
    }
    if (
      typeof body.password !== "string" ||
      body.password.length < 1 ||
      body.password.length > 256
    )
      return Response.json(
        { error: "Enter your passphrase." },
        { status: 400, headers },
      );
    if (!(await allowedAttempt(request)))
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429, headers: { ...headers, "Retry-After": "900" } },
      );
    const ok =
      body.action === "setup"
        ? await setup(body.token, body.password)
        : body.action === "login"
          ? await login(body.password, body.remember === true)
          : false;
    return Response.json(
      ok ? { ok: true } : { error: "Could not unlock. Check your passphrase." },
      { status: ok ? 200 : 401, headers },
    );
  } catch {
    return Response.json(
      { error: "Unlock is temporarily unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
