export const formatDateWithDay = (dateStr: string) => {
  if (!dateStr) return '';
  // Check if it's in YYYY-MM-DD format (or similar valid date strings)
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const dayName = days[d.getDay()];
      return `${month}/${date} (${dayName})`;
    }
  }
  return dateStr;
};
