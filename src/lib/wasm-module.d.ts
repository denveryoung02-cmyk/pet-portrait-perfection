// Cloudflare Workers Vite plugin convention: importing a .wasm file with
// `?module` yields a precompiled WebAssembly.Module (no runtime compilation,
// which Workers restricts) — same mechanism @cf-wasm/photon uses internally.
//
// This shorthand ambient module declaration only registers from a file with
// no top-level import/export (a true global script) — that's why it lives
// here rather than in env.d.ts, which augments '@tanstack/react-start' and
// is therefore itself a module.
declare module '*.wasm?module' {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
