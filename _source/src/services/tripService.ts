import { supabase } from '../lib/supabase';
import { Vuelta, AdminStats, Colegio, Fotografia } from '../types';
import { MOCK_TRIPS, INITIAL_STATS } from '../data/mockTrips';

// In-memory reactive state for mock sessions
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

      if (!error && data && data.length > 0) {
        return data as Vuelta[];
      }
    } catch (err) {
      console.warn('[TripService] Supabase offline, using local data fallback:', err);
    }

    // Fallback: search in local mock data
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
        .single();

      if (!error && data) {
        return data as Vuelta;
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

      if (!error && data && data.length > 0) {
        return data as Vuelta[];
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
    const newVuelta: Vuelta = {
      id: `v-${Date.now()}`,
      code: vuelta.code || `SB-${Math.floor(100 + Math.random() * 900)}`,
      date: vuelta.date || new Date().toISOString().split('T')[0],
      transport_type: vuelta.transport_type || 'airplane',
      transport_details: vuelta.transport_details || '',
      coordinator_name: vuelta.coordinator_name || 'Coordinador General',
      status: vuelta.status || 'borrador',
      cover_image:
        vuelta.cover_image ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      schools: vuelta.schools || [],
      photos: vuelta.photos || [],
      photo_count: (vuelta.photos || []).length,
      total_pax: (vuelta.schools || []).reduce((acc, s) => acc + (s.pax_count || 0), 0),
    };

    try {
      const { data, error } = await supabase.from('vueltas').insert([newVuelta]).select().single();
      if (!error && data) {
        return data as Vuelta;
      }
    } catch {
      // ignore
    }

    localTrips.unshift(newVuelta);
    localStats.vueltas_total += 1;
    return newVuelta;
  },

  /**
   * Add school to trip
   */
  async addSchool(vueltaId: string, school: Omit<Colegio, 'id' | 'vuelta_id'>): Promise<Colegio> {
    const newSchool: Colegio = {
      ...school,
      id: `sch-${Date.now()}`,
      vuelta_id: vueltaId,
    };

    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    if (trip) {
      trip.schools = [...(trip.schools || []), newSchool];
      trip.total_pax = trip.schools.reduce((acc, s) => acc + s.pax_count, 0);
    }

    return newSchool;
  },

  /**
   * Delete school from trip
   */
  async removeSchool(vueltaId: string, schoolId: string): Promise<boolean> {
    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    if (trip) {
      trip.schools = (trip.schools || []).filter((s) => s.id !== schoolId);
      trip.total_pax = trip.schools.reduce((acc, s) => acc + s.pax_count, 0);
      return true;
    }
    return false;
  },

  /**
   * Add photo to trip
   */
  async addPhoto(vueltaId: string, photo: Omit<Fotografia, 'id' | 'vuelta_id'>): Promise<Fotografia> {
    const newPhoto: Fotografia = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vuelta_id: vueltaId,
    };

    const trip = localTrips.find((t) => t.id === vueltaId || t.code === vueltaId);
    if (trip) {
      trip.photos = [newPhoto, ...(trip.photos || [])];
      trip.photo_count = trip.photos.length;
    }

    localStats.fotos_total += 1;
    return newPhoto;
  },

  /**
   * Get stats overview
   */
  async getStats(): Promise<AdminStats> {
    return { ...localStats };
  },
};
