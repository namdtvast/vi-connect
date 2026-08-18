/**
 * Adapter OAuth2 thật tới ORCID (https://orcid.org hoặc sandbox.orcid.org).
 * Cần đăng ký ứng dụng tại https://orcid.org/developer-tools để lấy
 * ORCID_CLIENT_ID/ORCID_CLIENT_SECRET — chủ repo tự đăng ký, không phải AI
 * (tạo tài khoản ngoài nằm ngoài phạm vi cho phép). Chưa cấu hình thì các
 * hàm dưới đây báo rõ, không giả vờ đã kết nối.
 */

function orcidBase(): string {
  return process.env.ORCID_ENV === "sandbox" ? "https://sandbox.orcid.org" : "https://orcid.org";
}

export function isOrcidOAuthConfigured(): boolean {
  return Boolean(process.env.ORCID_CLIENT_ID && process.env.ORCID_CLIENT_SECRET);
}

export function buildOrcidAuthorizeUrl(params: { redirectUri: string; state: string }): string {
  const clientId = process.env.ORCID_CLIENT_ID;
  if (!clientId) {
    throw new Error("ORCID_CLIENT_ID chưa được cấu hình.");
  }

  const url = new URL(`${orcidBase()}/oauth/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "/authenticate");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  return url.toString();
}

export type OrcidTokenResult = {
  orcid: string;
  name: string | null;
};

/** Đổi authorization code lấy ORCID iD đã xác thực thật (OAuth2). */
export async function exchangeOrcidCode(params: {
  code: string;
  redirectUri: string;
}): Promise<OrcidTokenResult | null> {
  const clientId = process.env.ORCID_CLIENT_ID;
  const clientSecret = process.env.ORCID_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  try {
    const res = await fetch(`${orcidBase()}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as Record<string, unknown>;
    if (typeof json.orcid !== "string") return null;
    return { orcid: json.orcid, name: typeof json.name === "string" ? json.name : null };
  } catch {
    return null;
  }
}
