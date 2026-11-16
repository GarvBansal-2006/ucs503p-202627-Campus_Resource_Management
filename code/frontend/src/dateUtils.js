export function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDaysAsDateInput(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

export function getDayOfWeekFromDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}
