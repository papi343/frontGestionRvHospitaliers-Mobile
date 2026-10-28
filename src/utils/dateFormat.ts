export const formatDateFr = (isoString?: string): string => {
  if (!isoString) return 'Date non définie';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTimeFr = (isoString?: string): string => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeRangeFr = (startIso?: string, endIso?: string): string => {
  return `${formatTimeFr(startIso)} - ${formatTimeFr(endIso)}`;
};
