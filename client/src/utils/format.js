export const REQUEST_STATUS_LABELS = {
  PENDING: 'Beklemede',
  IN_REVIEW: 'İnceleniyor',
  APPROVED: 'Kabul Edildi',
  REJECTED: 'Reddedildi',
  ANSWERED: 'Hoca yanıtladı',
};

export const getRequestStatusLabel = (status) =>
  REQUEST_STATUS_LABELS[status] || status || 'Beklemede';

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('tr-TR') : '-';

export const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : '-';
