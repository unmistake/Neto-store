export type IpLocation = {
  city?: string;
  state?: string;
  country?: string;
};

function decodeHeader(value: string | null): string {
  return value ? decodeURIComponent(value).replace(/\+/g, " ") : "";
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const firstForwardedIp = forwardedFor.split(",")[0]?.trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    firstForwardedIp ||
    ""
  );
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function locationFromHeaders(request: Request): IpLocation {
  return {
    city: decodeHeader(request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity")),
    state: decodeHeader(request.headers.get("x-vercel-ip-country-region") || request.headers.get("cf-region-code")),
    country: decodeHeader(request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry")),
  };
}

export async function resolveIpLocation(request: Request): Promise<IpLocation> {
  const headerLocation = locationFromHeaders(request);
  if (headerLocation.city || headerLocation.state || headerLocation.country) {
    return headerLocation;
  }

  const ip = getClientIp(request);
  if (isPrivateIp(ip)) {
    return {};
  }

  const template = process.env.IP_GEOLOCATION_API_URL || "https://ipwho.is/{ip}";
  const url = template.replace("{ip}", encodeURIComponent(ip));

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return {};
    }
    const data = await response.json();
    if (data?.success === false) {
      return {};
    }

    return {
      city: String(data?.city || data?.locality || ""),
      state: String(data?.region_code || data?.region || data?.regionCode || ""),
      country: String(data?.country || data?.country_code || data?.countryCode || ""),
    };
  } catch {
    return {};
  }
}
