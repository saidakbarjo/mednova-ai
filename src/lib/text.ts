export function initials(name: string) {
  return name.replace(/^Dr\.?\s+/i, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
export function age(dob?: string | null) {
  if (!dob) return null;
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}
export function greetingKey() {
  const h = new Date().getHours();
  return h < 5 ? "greet.evening" : h < 12 ? "greet.morning" : h < 18 ? "greet.afternoon" : "greet.evening";
}
export function groupDigits(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
