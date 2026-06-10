import { atom } from "jotai";

export interface DeveloperInfo {
  developer_id: string;
  public_key: string;
  name: string;
}

export const developerAtom = atom<DeveloperInfo | null>(null);
