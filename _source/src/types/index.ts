export type TransportType = 'airplane';
export type VueltaStatus = 'borrador' | 'publicada' | 'cerrada';
export type PhotoCategory = 'todas' | 'momentos' | 'destino' | 'carnaval';

export interface Vuelta {
  id: string;
  code: string; // e.g. "SB-102"
  date: string; // YYYY-MM-DD e.g. "2026-11-14"
  destination: string; // "Camboriú"
  transport_type: TransportType; // Siempre avión
  transport_details?: string; // e.g. "Vuelo Charter Aerolíneas / Gol"
  coordinator_name: string;
  status: VueltaStatus;
  cover_image: string;
  schools: Colegio[];
  photos: Fotografia[];
  total_pax?: number;
  photo_count?: number;
}

export interface Colegio {
  id: string;
  vuelta_id: string;
  contract_code: string; // e.g. "CT-1021"
  name: string; // e.g. "Colegio San Martín"
  pax_count: number;
  city?: string;
}

export interface Fotografia {
  id: string;
  vuelta_id: string;
  url: string;
  thumbnail_url?: string;
  category: 'momentos' | 'destino' | 'carnaval';
  filename: string;
  file_size?: number;
  created_at: string;
}

export interface Coordinador {
  id: string;
  name: string;
  email: string;
  phone: string;
  active_trips_count: number;
}

export interface AdminStats {
  vueltas_total: number;
  colegios_total: number;
  pax_total: number;
  fotos_total: number;
  visitas_total: number;
  descargas_total: number;
  clicks_dreamscda: number;
}
