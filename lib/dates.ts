export function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addLocalDays(days: number, date = new Date()): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return localDateString(result);
}
