export type TransportType = 'airplane' | 'bus';
export type VueltaStatus = 'borrador' | 'publicada' | 'cerrada';
export type PhotoCategory = 'todas' | 'momentos' | 'destino' | 'carnaval';

export interface Vuelta {
  id: string;
  code: string; // e.g. "SB-102"
  date: string; // YYYY-MM-DD e.g. "2026-10-14"
  transport_type: TransportType;
  transport_details?: string; // e.g. "Vuelo Charter AR-1920" o "Micro Doble Piso Plus"
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
  url: string; // Full CDN URL
  thumbnail_url?: string;
  category: 'momentos' | 'destino' | 'carnaval';
  filename: string;
  file_size?: number; // bytes
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
