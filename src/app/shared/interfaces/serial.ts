export interface Serial {
  _id: string;
  serialNumber: string;
  numOfChecks: number;
  __v: number;
  activated: boolean;
  branch?: string;
  productCode?: string;
  internalSerial?: string;
}
