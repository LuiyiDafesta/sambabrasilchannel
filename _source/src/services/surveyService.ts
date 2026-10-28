import { supabase } from '../lib/supabase';

export interface WebhookConfig {
  url: string;
  enabled: boolean;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'rating_1_10' | 'boolean';
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  survey_title?: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  group_code?: string;
  school_name?: string;
  answers: {
    question_id: string;
    question_text: string;
    answer: string | number | boolean;
  }[];
  created_at: string;
}

export interface AppSettings {
  webhook_config: WebhookConfig;
  dreamscda_banner: { enabled: boolean };
  tracking_script: { script: string };
  anychat_script: { script: string };
}

// Default initial settings
const DEFAULT_SETTINGS: AppSettings = {
  webhook_config: { url: '', enabled: false },
  dreamscda_banner: { enabled: true },
  tracking_script: { script: '' },
  anychat_script: { script: '' },
};

export const surveyService = {
  /**
   * Get all application settings
   */
  async getSettings(): Promise<AppSettings> {
    const settings = { ...DEFAULT_SETTINGS };
    try {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (!error && data && data.length > 0) {
        data.forEach((row) => {
          if (row.key in settings) {
            (settings as any)[row.key] = row.value;
          }
        });
        localStorage.setItem('sbc_app_settings', JSON.stringify(settings));
        return settings;
      }
    } catch (err) {
      console.warn('[SurveyService] Supabase settings error, reading localStorage fallback:', err);
    }

    const local = localStorage.getItem('sbc_app_settings');
    if (local) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      } catch {
        // ignore
      }
    }
    return settings;
  },

  /**
   * Update a specific application setting
   */
  async updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (!error) {
        // Update local cache
        const current = await this.getSettings();
        current[key] = value;
        localStorage.setItem('sbc_app_settings', JSON.stringify(current));
        return true;
      }
    } catch (err) {
      console.warn('[SurveyService] Update setting fallback:', err);
    }

    // Local storage fallback
    const local = localStorage.getItem('sbc_app_settings');
    const parsed = local ? JSON.parse(local) : { ...DEFAULT_SETTINGS };
    parsed[key] = value;
    localStorage.setItem('sbc_app_settings', JSON.stringify(parsed));
    return true;
  },

  /**
   * Get all surveys (admin)
   */
  async getSurveys(): Promise<Survey[]> {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Survey[];
      }
    } catch (err) {
      console.warn('[SurveyService] Error getting surveys:', err);
    }

    const local = localStorage.getItem('sbc_surveys');
    return local ? JSON.parse(local) : [];
  },

  /**
   * Get active surveys for passengers (frontend)
   */
  async getActiveSurveys(): Promise<Survey[]> {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Survey[];
      }
    } catch (err) {
      console.warn('[SurveyService] Error getting active surveys:', err);
    }

    const all = await this.getSurveys();
    return all.filter((s) => s.is_active);
  },

  /**
   * Create new survey
   */
  async createSurvey(surveyData: {
    title: string;
    description: string;
    questions: SurveyQuestion[];
    is_active: boolean;
  }): Promise<Survey> {
    const newSurvey: Survey = {
      id: `srv-${Date.now()}`,
      title: surveyData.title.trim(),
      description: surveyData.description.trim(),
      questions: surveyData.questions,
      is_active: surveyData.is_active,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('surveys').insert([newSurvey]).select().single();
      if (!error && data) {
        return data as Survey;
      }
    } catch (err) {
      console.warn('[SurveyService] Error creating survey in Supabase:', err);
    }

    const surveys = await this.getSurveys();
    const updated = [newSurvey, ...surveys];
    localStorage.setItem('sbc_surveys', JSON.stringify(updated));
    return newSurvey;
  },

  /**
   * Update existing survey
   */
  async updateSurvey(
    surveyId: string,
    surveyData: {
      title: string;
      description: string;
      questions: SurveyQuestion[];
      is_active: boolean;
    }
  ): Promise<Survey | null> {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({
          title: surveyData.title.trim(),
          description: surveyData.description.trim(),
          questions: surveyData.questions,
          is_active: surveyData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', surveyId)
        .select()
        .single();

      if (!error && data) {
        return data as Survey;
      }
    } catch (err) {
      console.warn('[SurveyService] Error updating survey in Supabase:', err);
    }

    const surveys = await this.getSurveys();
    const updated = surveys.map((s) =>
      s.id === surveyId ? { ...s, ...surveyData, updated_at: new Date().toISOString() } : s
    );
    localStorage.setItem('sbc_surveys', JSON.stringify(updated));
    return updated.find((s) => s.id === surveyId) || null;
  },

  /**
   * Toggle survey active state
   */
  async toggleSurveyActive(surveyId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', surveyId);

      if (!error) return true;
    } catch (err) {
      console.warn('[SurveyService] Error toggling survey:', err);
    }

    const surveys = await this.getSurveys();
    const updated = surveys.map((s) => (s.id === surveyId ? { ...s, is_active: isActive } : s));
    localStorage.setItem('sbc_surveys', JSON.stringify(updated));
    return true;
  },

  /**
   * Delete survey
   */
  async deleteSurvey(surveyId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('surveys').delete().eq('id', surveyId);
      if (!error) return true;
    } catch (err) {
      console.warn('[SurveyService] Error deleting survey:', err);
    }

    const surveys = await this.getSurveys();
    const updated = surveys.filter((s) => s.id !== surveyId);
    localStorage.setItem('sbc_surveys', JSON.stringify(updated));
    return true;
  },

  /**
   * Get passenger responses for inbox
   */
  async getResponses(page: number = 1, pageSize: number = 10): Promise<{ items: SurveyResponse[]; total: number }> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        return { items: data as SurveyResponse[], total: count || data.length };
      }
    } catch (err) {
      console.warn('[SurveyService] Error getting responses:', err);
    }

    const local = localStorage.getItem('sbc_survey_responses');
    const all: SurveyResponse[] = local ? JSON.parse(local) : [];
    const startIndex = (page - 1) * pageSize;
    return {
      items: all.slice(startIndex, startIndex + pageSize),
      total: all.length,
    };
  },

  /**
   * Submit passenger survey response from frontend
   * Handles saving in DB and triggering N8N webhook if configured
   */
  async submitResponse(payload: {
    survey_id: string;
    survey_title?: string;
    lead_name: string;
    lead_email: string;
    lead_phone?: string;
    group_code?: string;
    school_name?: string;
    answers: { question_id: string; question_text: string; answer: string | number | boolean }[];
  }): Promise<boolean> {
    const responseRecord: SurveyResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      created_at: new Date().toISOString(),
    };

    // 1. Save in Supabase
    try {
      await supabase.from('survey_responses').insert([responseRecord]);
    } catch (err) {
      console.warn('[SurveyService] Error saving response in Supabase, using localStorage:', err);
      const local = localStorage.getItem('sbc_survey_responses');
      const all: SurveyResponse[] = local ? JSON.parse(local) : [];
      all.unshift(responseRecord);
      localStorage.setItem('sbc_survey_responses', JSON.stringify(all));
    }

    // 2. Trigger Webhook (N8N) in background if enabled
    try {
      const settings = await this.getSettings();
      if (settings.webhook_config?.enabled && settings.webhook_config?.url?.trim()) {
        const webhookUrl = settings.webhook_config.url.trim();

        // Dispatched asynchronously without blocking UI
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'survey.completed',
            submitted_at: responseRecord.created_at,
            survey: {
              id: payload.survey_id,
              title: payload.survey_title,
            },
            lead: {
              name: payload.lead_name,
              email: payload.lead_email,
              phone: payload.lead_phone || null,
              group_code: payload.group_code || null,
              school_name: payload.school_name || null,
            },
            answers: payload.answers,
          }),
        }).catch((err) => {
          console.warn('[SurveyService] Webhook dispatch error (non-fatal):', err);
        });
      }
    } catch (err) {
      console.warn('[SurveyService] Failed to evaluate webhook dispatch:', err);
    }

    return true;
  },
};

