// Tipos mínimos de Web Bluetooth e WebUSB (Chrome/Edge, desktop), usados pela
// conexão do Anatix com hubs LEGO rodando Pybricks. O TypeScript ainda não traz
// essas APIs em lib.dom.

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly value: DataView | null;
  readValue(): Promise<DataView>;
  writeValueWithResponse(value: ArrayBufferView): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(uuid: string | number): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(uuid: string | number): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
}

interface Bluetooth extends EventTarget {
  requestDevice(options: {
    filters?: { services?: (string | number)[]; name?: string; namePrefix?: string }[];
    optionalServices?: (string | number)[];
    acceptAllDevices?: boolean;
  }): Promise<BluetoothDevice>;
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: "in" | "out";
  readonly type: "bulk" | "interrupt" | "isochronous";
  readonly packetSize: number;
}

interface USBAlternateInterface {
  readonly interfaceClass: number;
  readonly endpoints: USBEndpoint[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
}

interface USBConfiguration {
  readonly interfaces: USBInterface[];
}

interface USBInTransferResult {
  readonly data?: DataView;
  readonly status: "ok" | "stall" | "babble";
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: "ok" | "stall";
}

interface USBControlTransferParameters {
  requestType: "standard" | "class" | "vendor";
  recipient: "device" | "interface" | "endpoint" | "other";
  request: number;
  value: number;
  index: number;
}

interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly productName?: string;
  readonly configuration: USBConfiguration | null;
  readonly opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: ArrayBufferView): Promise<USBOutTransferResult>;
  controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
}

interface USBConnectionEvent extends Event {
  readonly device: USBDevice;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters: { vendorId?: number; productId?: number }[] }): Promise<USBDevice>;
}

interface Navigator {
  readonly bluetooth?: Bluetooth;
  readonly usb?: USB;
}
