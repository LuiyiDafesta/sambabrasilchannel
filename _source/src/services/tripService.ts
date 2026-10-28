import { supabase } from '../lib/supabase';
import { Vuelta, AdminStats, Colegio, Fotografia } from '../types';
import { MOCK_TRIPS, INITIAL_STATS } from '../data/mockTrips';

// In-memory fallback if needed
let localTrips = [...MOCK_TRIPS];
let localStats = { ...INITIAL_STATS };

export const tripService = {
  /**
   * Search trips by specific date (YYYY-MM-DD)
   */
  async getTripsByDate(date: string): Promise<Vuelta[]> {
    try {
      const { data, error } = await supabase
        .from('vueltas')
        .select('*, schools(*), photos(*)')
        .eq('date', date)
        .eq('status', 'publicada');

      if (!error && data) {
        return data.map((v) => ({
          ...v,
          schools: v.schools || [],
          photos: v.photos || [],
          photo_count: (v.photos || []).length,
          total_pax: (v.schools || []).reduce((acc: number, s: Colegio) => acc + (s.pax_count || 0), 0),
        })) as Vuelta[];
      }
    } catch (err) {
      console.warn('[TripService] Supabase offline, using local data fallback:', err);
    }

    return localTrips.filter((t) => t.date === date && t.status === 'publicada');
  },

  /**
   * Get single trip by ID or Code (e.g. "SB-102" or "v-102")
   */
  async getTripById(idOrCode: string): Promise<Vuelta | null> {
    const cleanParam = idOrCode.toLowerCase();
    try {
      const { data, error } = await supabase
        .from('vueltas')
        .select('*, schools(*), photos(*)')
        .or(`id.eq.${idOrCode},code.ilike.${idOrCode}`)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          schools: data.schools || [],
          photos: data.photos || [],
          photo_count: (data.photos || []).length,
          total_pax: (data.schools || []).reduce((acc: number, s: Colegio) => acc + (s.pax_count || 0), 0),
        } as Vuelta;
      }
    } catch (err) {
      console.warn('[TripService] Supabase fallback for trip detail:', err);
    }

    const matched = localTrips.find(
      (t) => t.id.toLowerCase() === cleanParam || t.code.toLowerCase() === cleanParam
    );
    return matched || null;
  },

  /**
   * Get all trips for admin dashboard
   */
  async getAllTrips(): Promise<Vuelta[]> {
    try {
      const { data, error } = await supabase
        .from('vueltas')
        .select('*, schools(*), photos(*)')
        .order('date', { ascending: false });

      if (!error && data) {
        return data.map((v) => ({
          ...v,
          schools: v.schools || [],
          photos: v.photos || [],
          photo_count: (v.photos || []).length,
          total_pax: (v.schools || []).reduce((acc: number, s: Colegio) => acc + (s.pax_count || 0), 0),
        })) as Vuelta[];
      }
    } catch (err) {
      console.warn('[TripService] Supabase admin trips fallback:', err);
    }

    return [...localTrips];
  },

  /**
   * Create a new Vuelta (Admin)
   */
  async createVuelta(vuelta: Partial<Vuelta>): Promise<Vuelta> {
    const vueltaId = vuelta.id || `v-${Date.now()}`;
    const code = vuelta.code || `SB-${Math.floor(100 + Math.random() * 900)}`;
    const date = vuelta.date || new Date().toISOString().split('T')[0];

    const dbPayload = {
      id: vueltaId,
      code,
      date,
      destination: vuelta.destination || 'Camboriú',
      transport_type: vuelta.transport_type || 'airplane',
      transport_details: vuelta.transport_details || '',
      coordinator_name: vuelta.coordinator_name || 'Coordinador General',
      status: vuelta.status || 'borrador',
      cover_image:
        vuelta.cover_image ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    };

    try {
      const { data, error } = await supabase
        .from('vueltas')
        .insert([dbPayload])
        .select('*, schools(*), photos(*)')
        .single();

      if (!error && data) {
        return {
          ...data,
          schools: data.schools || [],
          photos: data.photos || [],
          photo_count: (data.photos || []).length,
          total_pax: (data.schools || []).reduce((acc: number, s: Colegio) => acc + (s.pax_count || 0), 0),
        } as Vuelta;
      }
    } catch (err) {
      console.error('[TripService] Error creating vuelta in Supabase:', err);
    }

    const fallbackVuelta: Vuelta = {
      ...dbPayload,
      schools: [],
      photos: [],
      photo_count: 0,
      total_pax: 0,
    };
    localTrips.unshift(fallbackVuelta);
    localStats.vueltas_total += 1;
    return fallbackVuelta;
  },

  /**
   * Add school to trip
   */
  async addSchool(vueltaId: string, school: Omit<Colegio, 'id' | 'vuelta_id'>): Promise<Colegio> {
    const newSchoolId = `sch-${Date.now()}`;
    const payload = {
      id: newSchoolId,
      vuelta_id: vueltaId,
      contract_code: school.contract_code,
      name: school.name,
      pax_count: school.pax_count,
      city: school.city || '',
    };

    try {
      const { data, error } = await supabase.from('schools').insert([payload]).select().single();
      if (!error && data) {
        return data as Colegio;
      }
    } catch (err) {
      console.warn('[TripService] Add school fallback:', err);
    }

    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    if (trip) {
      trip.schools = [...(trip.schools || []), payload];
      trip.total_pax = trip.schools.reduce((acc, s) => acc + s.pax_count, 0);
    }
    return payload;
  },

  /**
   * Delete school from trip
   */
  async removeSchool(vueltaId: string, schoolId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('schools').delete().eq('id', schoolId);
      if (!error) return true;
    } catch (err) {
      console.warn('[TripService] Remove school fallback:', err);
    }

    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    if (trip) {
      trip.schools = (trip.schools || []).filter((s) => s.id !== schoolId);
      trip.total_pax = trip.schools.reduce((acc, s) => acc + s.pax_count, 0);
      return true;
    }
    return false;
  },

  /**
   * Add photo to trip (Admin only via Supabase RLS)
   */
  async addPhoto(vueltaId: string, photo: Omit<Fotografia, 'id' | 'vuelta_id'>): Promise<Fotografia> {
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payload = {
      id: photoId,
      vuelta_id: vueltaId,
      url: photo.url,
      thumbnail_url: photo.thumbnail_url || null,
      category: photo.category || 'momentos',
      filename: photo.filename,
      file_size: photo.file_size || null,
    };

    try {
      const { data, error } = await supabase.from('photos').insert([payload]).select().single();
      if (!error && data) {
        return data as Fotografia;
      }
      if (error) {
        console.error('[TripService] Error adding photo to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('[TripService] Add photo fallback:', err);
    }

    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    const fallbackPhoto = { ...payload, created_at: new Date().toISOString() };
    if (trip) {
      trip.photos = [fallbackPhoto, ...(trip.photos || [])];
      trip.photo_count = trip.photos.length;
    }
    localStats.fotos_total += 1;
    return fallbackPhoto;
  },

  /**
   * Delete photo from trip (Admin only via Supabase RLS)
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('photos').delete().eq('id', photoId);
      if (!error) return true;
      if (error) console.error('[TripService] Error deleting photo:', error.message);
    } catch (err) {
      console.warn('[TripService] Delete photo fallback:', err);
    }

    localTrips.forEach((t) => {
      t.photos = t.photos.filter((p) => p.id !== photoId);
      t.photo_count = t.photos.length;
    });
    return true;
  },

  /**
   * Get stats overview from Supabase with fallback
   */
  async getStats(): Promise<AdminStats> {
    try {
      const [vueltasRes, schoolsRes, photosRes] = await Promise.all([
        supabase.from('vueltas').select('*', { count: 'exact', head: true }),
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
      ]);

      const { data: schoolsData } = await supabase.from('schools').select('pax_count');
      const paxTotal = schoolsData ? schoolsData.reduce((acc, s) => acc + (s.pax_count || 0), 0) : localStats.pax_total;

      return {
        vueltas_total: vueltasRes.count ?? localStats.vueltas_total,
        colegios_total: schoolsRes.count ?? localStats.colegios_total,
        pax_total: paxTotal,
        fotos_total: photosRes.count ?? localStats.fotos_total,
        visitas_total: localStats.visitas_total,
        descargas_total: localStats.descargas_total,
        clicks_dreamscda: localStats.clicks_dreamscda,
      };
    } catch {
      return { ...localStats };
    }
  },
};
