export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskType = 'heat' | 'malaria' | 'diarrhea' | 'respiratory';
export type AlertStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'cancelled';
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
export type ReportStatus = 'generating' | 'ready' | 'failed';
export type ReportType = 'weekly' | 'monthly' | 'custom';
export type ReportFormat = 'pdf' | 'excel';
export type SymptomType = 'fever' | 'diarrhea' | 'cough' | 'vomiting' | 'rash' | 'respiratory' | 'malaria_symptoms' | 'other';
export type ConsentStatus = 'accepted' | 'declined' | 'pending';
export type Channel = 'ussd' | 'sms' | 'whatsapp';

export interface ClinicLocation {
  id: number;
  province: string;
  district: string;
  locality?: string;
  latitude: number;
  longitude: number;
  malaria_risk_static: number;
  sanitation_score: number;
  flood_risk: number;
  is_coastal: boolean;
  is_urban: boolean;
}

export interface Alert {
  id: number;
  location: ClinicLocation;
  risk_type: RiskType;
  risk_level: RiskLevel;
  score: number;
  message: string;
  channel: string;
  status: AlertStatus;
  sent_at: string;
  delivery_report?: string;
  created_at: string;
}

export interface Household {
  id: number;
  phone_number: string;
  language: string;
  channel: Channel;
  subscription_active: boolean;
  location: ClinicLocation;
  number_of_children: number;
  children_age_groups: string[];
  pregnant_woman: boolean;
  weeks_pregnant?: string;
  vulnerability_score: number;
  consent_status: ConsentStatus;
  created_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  message: string;
  zone: string;
  province: string;
  district: string;
  risk_type: RiskType;
  status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  delivered: number;
  failed: number;
  created_at: string;
  created_by: string;
}

export interface Report {
  id: number;
  name: string;
  period_start: string;
  period_end: string;
  province: string;
  district?: string;
  report_type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  created_at: string;
  download_url?: string;
  alerts_count: number;
  families_covered: number;
}

export interface SymptomReport {
  id: number;
  phone_number: string;
  symptoms: SymptomType[];
  location: ClinicLocation;
  channel: Channel;
  notes: string;
  created_at: string;
  reviewed: boolean;
}

export interface ClinicKPI {
  registered_families: number;
  estimated_children: number;
  active_alerts: number;
  alert_coverage_percent: number;
  expected_consultations: {
    heat: number;
    malaria: number;
    diarrhea: number;
    respiratory: number;
  };
  recommended_stock: {
    antimalarials: number;
    ors: number;
    iv_solutions: number;
  };
  unreached_vulnerable: number;
  trend_7days: { date: string; alerts: number; symptoms: number }[];
}

export interface RiskMapZone {
  province: string;
  district: string;
  risk_level: RiskLevel;
  score: number;
  risk_type: RiskType;
  families_count: number;
  children_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface FilterOptions {
  province?: string;
  district?: string;
  locality?: string;
  risk_level?: RiskLevel;
  risk_type?: RiskType;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
  status?: string;
}
