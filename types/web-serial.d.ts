// Tipos mínimos da Web Serial API (Chrome/Edge/Opera, desktop).
// O TypeScript ainda não traz isso em lib.dom.

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  bufferSize?: number;
  flowControl?: "none" | "hardware";
}

interface SerialPort extends EventTarget {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
  forget?(): Promise<void>;
}

interface Serial extends EventTarget {
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: {
    filters?: { usbVendorId?: number; usbProductId?: number }[];
  }): Promise<SerialPort>;
}

interface Navigator {
  readonly serial?: Serial;
}
