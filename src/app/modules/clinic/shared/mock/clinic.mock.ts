import {
  Alert, Campaign, ClinicKPI, ClinicLocation, Household,
  Report, RiskMapZone, SymptomReport,
} from '../types/clinic.types';

export const MOCK_LOCATIONS: ClinicLocation[] = [
  { id: 1, province: 'Maputo', district: 'KaMpfumo', locality: 'Alto-Maé', latitude: -25.9, longitude: 32.6, malaria_risk_static: 15, sanitation_score: 70, flood_risk: 10, is_coastal: true, is_urban: true },
  { id: 2, province: 'Maputo', district: 'KaMaxaqueni', locality: 'Maxaqueni', latitude: -25.97, longitude: 32.56, malaria_risk_static: 25, sanitation_score: 55, flood_risk: 20, is_coastal: false, is_urban: true },
  { id: 3, province: 'Gaza', district: 'Chokwé', locality: 'Chokwé Sede', latitude: -24.52, longitude: 32.97, malaria_risk_static: 38, sanitation_score: 35, flood_risk: 40, is_coastal: false, is_urban: false },
  { id: 4, province: 'Sofala', district: 'Buzi', locality: 'Buzi Sede', latitude: -19.84, longitude: 34.69, malaria_risk_static: 35, sanitation_score: 30, flood_risk: 45, is_coastal: false, is_urban: false },
  { id: 5, province: 'Sofala', district: 'Beira', locality: 'Munhava', latitude: -19.83, longitude: 34.84, malaria_risk_static: 30, sanitation_score: 50, flood_risk: 35, is_coastal: true, is_urban: true },
  { id: 6, province: 'Nampula', district: 'Nacala', locality: 'Nacala Porto', latitude: -14.54, longitude: 40.67, malaria_risk_static: 28, sanitation_score: 45, flood_risk: 15, is_coastal: true, is_urban: false },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 1, location: MOCK_LOCATIONS[2], risk_type: 'malaria', risk_level: 'critical', score: 91,
    message: 'ChildShield: Chuvas recentes aumentam risco de malária em Chokwé. Use rede mosquiteira e elimine água parada. Para cancelar: SAIR.',
    channel: 'sms', status: 'delivered', sent_at: '2026-05-03T08:30:00',
    delivery_report: 'Success: 1247/1312 entregues', created_at: '2026-05-03T08:00:00',
  },
  {
    id: 2, location: MOCK_LOCATIONS[4], risk_type: 'heat', risk_level: 'high', score: 75,
    message: 'ChildShield: Calor extremo em Beira. Dê mais líquidos à criança e evite sol entre 11h-15h. Para cancelar: SAIR.',
    channel: 'sms', status: 'delivered', sent_at: '2026-05-03T09:00:00',
    delivery_report: 'Success: 892/950 entregues', created_at: '2026-05-03T09:00:00',
  },
  {
    id: 3, location: MOCK_LOCATIONS[1], risk_type: 'diarrhea', risk_level: 'high', score: 68,
    message: 'ChildShield: Risco de diarreia após chuvas em Maxaqueni. Ferva a água antes de usar. Para cancelar: SAIR.',
    channel: 'whatsapp', status: 'sent', sent_at: '2026-05-02T14:00:00', created_at: '2026-05-02T14:00:00',
  },
  {
    id: 4, location: MOCK_LOCATIONS[3], risk_type: 'malaria', risk_level: 'critical', score: 88,
    message: 'ChildShield: Alerta crítico de malária em Buzi. Procure unidade sanitária se a criança tiver febre. Para cancelar: SAIR.',
    channel: 'sms', status: 'delivered', sent_at: '2026-05-04T06:30:00', created_at: '2026-05-04T06:00:00',
  },
  {
    id: 5, location: MOCK_LOCATIONS[0], risk_type: 'respiratory', risk_level: 'medium', score: 45,
    message: 'ChildShield: Qualidade do ar reduzida em Maputo. Evite actividades ao ar livre com crianças. Para cancelar: SAIR.',
    channel: 'sms', status: 'sent', sent_at: '2026-05-01T10:00:00', created_at: '2026-05-01T10:00:00',
  },
  {
    id: 6, location: MOCK_LOCATIONS[5], risk_type: 'diarrhea', risk_level: 'medium', score: 52,
    message: 'ChildShield: Dica de prevenção em Nacala. Lave as mãos frequentemente e use água tratada.',
    channel: 'whatsapp', status: 'delivered', sent_at: '2026-04-28T11:00:00', created_at: '2026-04-28T11:00:00',
  },
  {
    id: 7, location: MOCK_LOCATIONS[2], risk_type: 'diarrhea', risk_level: 'high', score: 72,
    message: 'ChildShield: Risco elevado de diarreia em Chokwé após cheias. Evite água não tratada.',
    channel: 'sms', status: 'failed', sent_at: '2026-04-27T08:00:00', created_at: '2026-04-27T08:00:00',
  },
  {
    id: 8, location: MOCK_LOCATIONS[4], risk_type: 'malaria', risk_level: 'medium', score: 48,
    message: 'ChildShield: Dica semanal — use rede mosquiteira todas as noites em Beira.',
    channel: 'sms', status: 'delivered', sent_at: '2026-04-25T09:00:00', created_at: '2026-04-25T09:00:00',
  },
];

export const MOCK_HOUSEHOLDS: Household[] = [
  {
    id: 1, phone_number: '+258 84 XXX 0001', language: 'pt', channel: 'ussd', subscription_active: true,
    location: MOCK_LOCATIONS[2], number_of_children: 3, children_age_groups: ['0-1', '1-5'],
    pregnant_woman: true, weeks_pregnant: '13-24', vulnerability_score: 82,
    consent_status: 'accepted', created_at: '2026-03-15T10:00:00',
  },
  {
    id: 2, phone_number: '+258 84 XXX 0002', language: 'changane', channel: 'sms', subscription_active: true,
    location: MOCK_LOCATIONS[3], number_of_children: 4, children_age_groups: ['0-1', '1-5', '6-12'],
    pregnant_woman: false, vulnerability_score: 75, consent_status: 'accepted', created_at: '2026-03-20T14:00:00',
  },
  {
    id: 3, phone_number: '+258 82 XXX 0003', language: 'pt', channel: 'whatsapp', subscription_active: true,
    location: MOCK_LOCATIONS[4], number_of_children: 2, children_age_groups: ['1-5'],
    pregnant_woman: false, vulnerability_score: 55, consent_status: 'accepted', created_at: '2026-04-01T09:00:00',
  },
  {
    id: 4, phone_number: '+258 86 XXX 0004', language: 'sena', channel: 'ussd', subscription_active: true,
    location: MOCK_LOCATIONS[3], number_of_children: 5, children_age_groups: ['0-1', '1-5', '6-12'],
    pregnant_woman: true, weeks_pregnant: '25-40', vulnerability_score: 91,
    consent_status: 'accepted', created_at: '2026-04-05T08:00:00',
  },
  {
    id: 5, phone_number: '+258 84 XXX 0005', language: 'pt', channel: 'whatsapp', subscription_active: false,
    location: MOCK_LOCATIONS[0], number_of_children: 1, children_age_groups: ['0-1'],
    pregnant_woman: false, vulnerability_score: 30, consent_status: 'accepted', created_at: '2026-02-10T16:00:00',
  },
  {
    id: 6, phone_number: '+258 82 XXX 0006', language: 'macua', channel: 'ussd', subscription_active: true,
    location: MOCK_LOCATIONS[5], number_of_children: 3, children_age_groups: ['1-5', '6-12'],
    pregnant_woman: false, vulnerability_score: 62, consent_status: 'accepted', created_at: '2026-04-12T11:00:00',
  },
  {
    id: 7, phone_number: '+258 84 XXX 0007', language: 'pt', channel: 'sms', subscription_active: true,
    location: MOCK_LOCATIONS[1], number_of_children: 2, children_age_groups: ['1-5'],
    pregnant_woman: false, vulnerability_score: 48, consent_status: 'accepted', created_at: '2026-04-20T13:00:00',
  },
  {
    id: 8, phone_number: '+258 86 XXX 0008', language: 'changane', channel: 'ussd', subscription_active: true,
    location: MOCK_LOCATIONS[2], number_of_children: 6, children_age_groups: ['0-1', '1-5', '6-12'],
    pregnant_woman: true, weeks_pregnant: '1-12', vulnerability_score: 88,
    consent_status: 'accepted', created_at: '2026-04-22T08:30:00',
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1, name: 'Alerta Malária — Gaza (Mai 2026)',
    message: 'ChildShield: Alerta malária em Gaza. Use rede mosquiteira todas as noites. Procure o centro de saúde se a criança tiver febre alta.',
    zone: 'Gaza', province: 'Gaza', district: 'Chokwé', risk_type: 'malaria', status: 'sent',
    sent_at: '2026-05-03T08:00:00', total_recipients: 3200, delivered: 3041, failed: 159,
    created_at: '2026-05-02T16:00:00', created_by: 'Dr. Ana Silva',
  },
  {
    id: 2, name: 'Calor Extremo — Beira (Mai 2026)',
    message: 'ChildShield: Alerta calor em Beira. Dê mais água à criança e evite sol entre 11h-15h.',
    zone: 'Sofala', province: 'Sofala', district: 'Beira', risk_type: 'heat', status: 'scheduled',
    scheduled_at: '2026-05-05T08:00:00', total_recipients: 2800, delivered: 0, failed: 0,
    created_at: '2026-05-04T10:00:00', created_by: 'Enf. Carlos Matos',
  },
  {
    id: 3, name: 'Prevenção Diarreia — Maputo (Abr 2026)',
    message: 'ChildShield: Dica de prevenção. Ferva a água antes de usar e lave as mãos com sabão.',
    zone: 'Maputo', province: 'Maputo', district: 'KaMaxaqueni', risk_type: 'diarrhea', status: 'sent',
    sent_at: '2026-04-25T09:00:00', total_recipients: 1500, delivered: 1423, failed: 77,
    created_at: '2026-04-24T14:00:00', created_by: 'Dr. Ana Silva',
  },
  {
    id: 4, name: 'Campanha Respiratório — Nacala (Draft)',
    message: 'ChildShield: Qualidade do ar reduzida. Evite actividades intensas ao ar livre com crianças.',
    zone: 'Nampula', province: 'Nampula', district: 'Nacala', risk_type: 'respiratory', status: 'draft',
    total_recipients: 0, delivered: 0, failed: 0,
    created_at: '2026-05-04T09:00:00', created_by: 'Enf. Maria João',
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 1, name: 'Relatório Mensal — Abril 2026 — Gaza', period_start: '2026-04-01', period_end: '2026-04-30',
    province: 'Gaza', district: 'Chokwé', report_type: 'monthly', format: 'pdf', status: 'ready',
    created_at: '2026-05-01T06:00:00', download_url: '/reports/april-2026-gaza.pdf',
    alerts_count: 47, families_covered: 1312,
  },
  {
    id: 2, name: 'Relatório Semanal — Semana 18 — Sofala', period_start: '2026-04-28', period_end: '2026-05-04',
    province: 'Sofala', district: 'Beira', report_type: 'weekly', format: 'excel', status: 'ready',
    created_at: '2026-05-04T07:00:00', download_url: '/reports/week18-sofala.xlsx',
    alerts_count: 12, families_covered: 950,
  },
  {
    id: 3, name: 'Relatório Personalizado — Maputo (Jan–Mar 2026)', period_start: '2026-01-01', period_end: '2026-03-31',
    province: 'Maputo', report_type: 'custom', format: 'pdf', status: 'generating',
    created_at: '2026-05-04T11:00:00', alerts_count: 0, families_covered: 0,
  },
  {
    id: 4, name: 'Relatório Mensal — Março 2026 — Nacional', period_start: '2026-03-01', period_end: '2026-03-31',
    province: 'Nacional', report_type: 'monthly', format: 'pdf', status: 'ready',
    created_at: '2026-04-01T06:00:00', download_url: '/reports/march-2026-national.pdf',
    alerts_count: 134, families_covered: 8247,
  },
];

export const MOCK_SYMPTOM_REPORTS: SymptomReport[] = [
  {
    id: 1, phone_number: '+258 84 XXX 1001', symptoms: ['fever', 'cough'],
    location: MOCK_LOCATIONS[2], channel: 'whatsapp',
    notes: 'Criança com febre há 2 dias e tosse persistente', created_at: '2026-05-04T09:15:00', reviewed: false,
  },
  {
    id: 2, phone_number: '+258 82 XXX 1002', symptoms: ['diarrhea', 'vomiting'],
    location: MOCK_LOCATIONS[3], channel: 'whatsapp',
    notes: 'Bebé com diarreia e vómitos desde ontem', created_at: '2026-05-04T08:30:00', reviewed: false,
  },
  {
    id: 3, phone_number: '+258 86 XXX 1003', symptoms: ['fever'],
    location: MOCK_LOCATIONS[3], channel: 'whatsapp',
    notes: 'Febre alta, possível malária', created_at: '2026-05-03T18:00:00', reviewed: true,
  },
  {
    id: 4, phone_number: '+258 84 XXX 1004', symptoms: ['cough', 'rash'],
    location: MOCK_LOCATIONS[4], channel: 'whatsapp',
    notes: 'Tosse e manchas na pele da criança', created_at: '2026-05-03T14:30:00', reviewed: false,
  },
  {
    id: 5, phone_number: '+258 82 XXX 1005', symptoms: ['fever', 'diarrhea'],
    location: MOCK_LOCATIONS[5], channel: 'whatsapp',
    notes: 'Criança com febre e diarreia aquosa', created_at: '2026-05-02T11:00:00', reviewed: true,
  },
  {
    id: 6, phone_number: '+258 84 XXX 1006', symptoms: ['vomiting'],
    location: MOCK_LOCATIONS[1], channel: 'whatsapp',
    notes: 'Vómitos após refeição', created_at: '2026-05-01T20:00:00', reviewed: true,
  },
];

export const MOCK_KPI: ClinicKPI = {
  registered_families: 8247,
  estimated_children: 23891,
  active_alerts: 4,
  alert_coverage_percent: 87.3,
  expected_consultations: { heat: 145, malaria: 312, diarrhea: 198, respiratory: 67 },
  recommended_stock: { antimalarials: 450, ors: 320, iv_solutions: 85 },
  unreached_vulnerable: 1061,
  trend_7days: [
    { date: '28 Abr', alerts: 12, symptoms: 8 },
    { date: '29 Abr', alerts: 15, symptoms: 11 },
    { date: '30 Abr', alerts: 9, symptoms: 7 },
    { date: '01 Mai', alerts: 22, symptoms: 18 },
    { date: '02 Mai', alerts: 18, symptoms: 14 },
    { date: '03 Mai', alerts: 31, symptoms: 23 },
    { date: '04 Mai', alerts: 27, symptoms: 19 },
  ],
};

export const MOCK_RISK_MAP: RiskMapZone[] = [
  { province: 'Gaza', district: 'Chokwé', risk_level: 'critical', score: 91, risk_type: 'malaria', families_count: 1312, children_count: 3847 },
  { province: 'Sofala', district: 'Buzi', risk_level: 'critical', score: 88, risk_type: 'malaria', families_count: 892, children_count: 2541 },
  { province: 'Sofala', district: 'Beira', risk_level: 'high', score: 75, risk_type: 'heat', families_count: 950, children_count: 2712 },
  { province: 'Maputo', district: 'KaMaxaqueni', risk_level: 'high', score: 68, risk_type: 'diarrhea', families_count: 720, children_count: 1980 },
  { province: 'Nampula', district: 'Nacala', risk_level: 'medium', score: 52, risk_type: 'diarrhea', families_count: 580, children_count: 1620 },
  { province: 'Maputo', district: 'KaMpfumo', risk_level: 'medium', score: 45, risk_type: 'respiratory', families_count: 1100, children_count: 2900 },
];
