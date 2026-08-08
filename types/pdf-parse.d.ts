// pdf-parse v2 ships its own types; this shim is for sub-path imports only.
// The `pdf-parse/lib/pdf-parse.js` path used by v1 does not exist in v2 —
// embed.ts uses the v2 class-based API (`PDFParse`) instead.
declare module "pdf-parse/lib/pdf-parse.js" {
  const pdf: (buffer: Buffer) => Promise<{ text: string }>;
  export default pdf;
}
