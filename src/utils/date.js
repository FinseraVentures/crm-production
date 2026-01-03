export const normalizeDateOnly = (dateString) => {
  if (!dateString) return null;

  const d = new Date(dateString);
  d.setUTCHours(12, 0, 0, 0); // 🔥 noon UTC
  return d;
};
