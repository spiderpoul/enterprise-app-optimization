const initializationPlan = [
  {
    id: 'services-bootstrap',
    label: 'Bootstrapping shared telemetry and notification services…',
    duration: 650,
  },
  {
    id: 'user-settings',
    label: 'Retrieving operator workspace preferences…',
    duration: 820,
  },
  {
    id: 'catalog-sync',
    label: 'Synchronising automation catalog metadata…',
    duration: 1240,
  },
  {
    id: 'permissions',
    label: 'Resolving permission boundaries and access policies…',
    duration: 1040,
  },
  {
    id: 'final-handshake',
    label: 'Finalising service handshakes and secure channels…',
    duration: 870,
  },
];

module.exports = { initializationPlan };
