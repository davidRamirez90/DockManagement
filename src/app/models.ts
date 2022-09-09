export interface DockStateModel {
  sensorSlots: SensorSlot[][];
  currentlySelectedSet: Set;
  existingSets: Set[];
}

export interface SensorSlot {
  setId: string;
  occupied: boolean;
  position: number;
  current?: boolean;
}

export enum DockType {
  GEN_3 = 3,
  GEN_5 = 5,
}

export enum SetType {
  LTR = 'LTR',
  SINGLE = 'Single',
}

export interface Set {
  id: string;
  setType: SetType;
  position: number;
  color: string;
  is_outlined: boolean;
}

export interface Dock {
  dockType: DockType;
  sets: Set[];
}
