import { UserResponse, VCResponse } from "@/apis/registry/types";
import { atom } from "jotai";

export const registryTokenAtom = atom<string | null>(null);
export const userAtom = atom<UserResponse | null>(null);
export const userCredsAtom = atom<VCResponse[]>([]);
