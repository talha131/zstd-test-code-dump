declare module 'zstd-codec' {
  export class ZstdCodec {
    // Run method optionally takes a callback but also returns a Promise
    static run(callback?: (zstd: ZstdCodec) => void): Promise<ZstdCodec>;

    // Simple codec constructor
    Simple: new () => any;

    // Streaming codec constructor with a defined decompress method
    Streaming: new () => {
      decompress: (data: Uint8Array) => Uint8Array;
    };
  }
}

