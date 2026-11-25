/**
 * Formatea milisegundos a MM:SS.
 */
export function formatTimeFromMillis(millis: number): string {
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea segundos a MM:SS (o cadena vacía si no hay duración).
 */
export function formatDurationSeconds(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convierte bytes a megabytes con un decimal.
 */
export function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}
