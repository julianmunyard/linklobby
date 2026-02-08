// Track loader Worker for Superpowered SDK
// Fetches and decodes audio files using Superpowered WASM
// This Worker is loaded directly (not via blob URL) to avoid
// Turbopack mangling SuperpoweredGlue.toString()

importScripts('/SP-es6-classic.js');

SuperpoweredGlue.wasmCDNUrl = '/superpowered/superpowered.wasm';
onmessage = SuperpoweredGlue.loaderWorkerOnmessage;
