// Server-side stub — @react-pdf/renderer uses node:fs which is unavailable
// in Cloudflare Workers. The real module is loaded client-side via dynamic import.
export const Document = () => null;
export const Page = () => null;
export const Text = () => null;
export const View = () => null;
export const StyleSheet = { create: (s: unknown) => s };
export const pdf = () => ({ toBlob: () => Promise.resolve(new Blob()) });
export default {};
