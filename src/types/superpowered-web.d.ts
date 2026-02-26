// Type declarations for @superpoweredsdk/web
// Ported from Munyard Mixer's types/superpowered-web.d.ts

declare module '@superpoweredsdk/web' {
  export class SuperpoweredGlue {
    static wasmCDNUrl: string
    static Instantiate(licenseKey: string, wasmPath?: string): Promise<any>
  }

  export class SuperpoweredWebAudio {
    audioContext: AudioContext
    constructor(sampleRate: number, superpowered: any)
    createAudioNodeAsync(
      url: string,
      processorName: string,
      onMessageFromAudioScope: (message: any) => void
    ): Promise<any>
  }
}
