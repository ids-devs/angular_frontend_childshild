import { NavItem } from '../../layouts/full/sidebar/nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Início',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:atom-line-duotone',
    route: '/dashboard',
  },

  {
    navCap: 'Painel ONG / Clínica',
  },
  {
    displayName: 'Visão Geral',
    iconName: 'solar:chart-2-line-duotone',
    route: '/clinic/overview',
  },
  {
    displayName: 'Alertas Climáticos',
    iconName: 'solar:bell-bing-line-duotone',
    route: '/clinic/alerts',
  },
  {
    displayName: 'Famílias Registadas',
    iconName: 'solar:users-group-rounded-line-duotone',
    route: '/clinic/families',
  },
  {
    displayName: 'Campanhas SMS',
    iconName: 'solar:chat-round-dots-line-duotone',
    route: '/clinic/campaigns',
  },
  {
    displayName: 'Relatórios',
    iconName: 'solar:document-text-line-duotone',
    route: '/clinic/reports',
  },
  {
    displayName: 'Reportes de Sintomas',
    iconName: 'solar:stethoscope-line-duotone',
    route: '/clinic/symptom-reports',
  },
];
