import { apiFetch } from "./apiClient";

export type ConstructorRow = {
  constructor_id: number;
  name: string;
  slug: string;
  nationality: string;
  price: number;
};

export function getConstructors() {
  return apiFetch<ConstructorRow[]>(`/api/fantasy/constructors`);
}
