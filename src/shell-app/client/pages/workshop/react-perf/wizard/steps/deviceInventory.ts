export interface DeviceInventoryItem {
  id: string;
  name: string;
  os: string;
  owner: string;
  location: string;
  risk: 'Low' | 'Medium' | 'High';
}

export const deviceInventory: DeviceInventoryItem[] = [
  {
    id: 'dev-001',
    name: 'CEO Surface Pro',
    os: 'Windows 11',
    owner: 'Mia Chen',
    location: 'New York HQ',
    risk: 'High',
  },
  {
    id: 'dev-002',
    name: 'Finance Analyst MacBook',
    os: 'macOS 14',
    owner: 'Arthur Bell',
    location: 'London Office',
    risk: 'Medium',
  },
  {
    id: 'dev-003',
    name: 'SOC Analyst Workstation',
    os: 'Windows 10',
    owner: 'Priya Das',
    location: 'Singapore SOC',
    risk: 'Low',
  },
  {
    id: 'dev-004',
    name: 'Sales Tablet 01',
    os: 'iPadOS 17',
    owner: 'Kenji Mori',
    location: 'Tokyo Field',
    risk: 'Medium',
  },
  {
    id: 'dev-005',
    name: 'R&D Build Server',
    os: 'Ubuntu 22.04',
    owner: 'Automation Pool',
    location: 'Berlin Lab',
    risk: 'High',
  },
  {
    id: 'dev-006',
    name: 'Legal Team Laptop',
    os: 'Windows 11',
    owner: 'Sara Nunez',
    location: 'Madrid Office',
    risk: 'Medium',
  },
  {
    id: 'dev-007',
    name: 'Marketing Chromebook',
    os: 'ChromeOS 120',
    owner: 'Isabella Conti',
    location: 'Remote',
    risk: 'Low',
  },
  {
    id: 'dev-008',
    name: 'IT Admin Tower',
    os: 'Windows Server 2022',
    owner: 'Ops Rotation',
    location: 'New York HQ',
    risk: 'High',
  },
  {
    id: 'dev-009',
    name: 'Support Agent Laptop',
    os: 'Windows 10',
    owner: 'Jonah Ruiz',
    location: 'Austin Support',
    risk: 'Medium',
  },
  {
    id: 'dev-010',
    name: 'Field Engineer Tablet',
    os: 'Android 14',
    owner: 'Nina Petrova',
    location: 'Remote',
    risk: 'Low',
  },
  {
    id: 'dev-011',
    name: 'CFO MacBook Pro',
    os: 'macOS 14',
    owner: 'Evelyn Harper',
    location: 'New York HQ',
    risk: 'High',
  },
  {
    id: 'dev-012',
    name: 'DevSecOps Laptop',
    os: 'Fedora 39',
    owner: 'Lars Kruger',
    location: 'Berlin Lab',
    risk: 'Medium',
  },
];
