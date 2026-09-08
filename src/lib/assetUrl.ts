const LOVABLE_ASSET_ORIGIN = "https://questbound-keeper.lovable.app";

export function assetUrl(url: string) {
  if (url.startsWith("/__l5e/assets-v1/")) {
    return `${LOVABLE_ASSET_ORIGIN}${url}`;
  }

  return url;
}