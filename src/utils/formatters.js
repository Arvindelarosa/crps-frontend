import moment from 'moment';

export const formatCurrency = (amount) => {
  if (!amount) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

export const formatDate = (date, format = 'MMMM DD, YYYY') => {
  if (!date) return 'N/A';
  return moment(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return moment(date).format('MM/DD/YYYY hh:mm A');
};

export const calculateAge = (birthdate) => {
  if (!birthdate) return 0;
  return moment().diff(moment(birthdate), 'years');
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
