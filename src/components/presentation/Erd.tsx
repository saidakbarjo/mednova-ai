/** Entity–relationship diagram of the MEDNOVA AI schema, drawn as SVG. */
type Col = [name: string, type: string, key?: "PK" | "FK" | "UQ"];
type Table = { id: string; x: number; y: number; cols: Col[] };

const W = 250;
const HEAD = 34;
const ROW = 22;

const TABLES: Table[] = [
  { id: "messages", x: 20, y: 20, cols: [["id", "uuid", "PK"], ["conversation_id", "uuid", "FK"], ["role", "text"], ["content", "text"], ["is_emergency", "bool"], ["source", "text"]] },
  { id: "conversations", x: 320, y: 20, cols: [["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["title", "text"], ["updated_at", "timestamptz"]] },
  { id: "users", x: 620, y: 20, cols: [["id", "uuid", "PK"], ["email", "text", "UQ"], ["password_hash", "text"], ["full_name", "text"], ["role", "patient|doctor|admin"], ["is_active", "bool"]] },
  { id: "notifications", x: 920, y: 20, cols: [["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["type", "text"], ["title", "text"], ["is_read", "bool"]] },
  { id: "medical_records", x: 20, y: 300, cols: [["id", "uuid", "PK"], ["patient_id", "uuid", "FK"], ["doctor_id", "uuid", "FK"], ["appointment_id", "uuid", "FK"], ["record_type", "text"], ["data", "jsonb"], ["recorded_at", "timestamptz"]] },
  { id: "patients", x: 320, y: 300, cols: [["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["date_of_birth", "date"], ["blood_type", "text"], ["height_cm", "numeric"], ["weight_kg", "numeric"], ["allergies", "text"]] },
  { id: "doctors", x: 620, y: 300, cols: [["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["specialization_id", "int", "FK"], ["years_experience", "int"], ["consultation_fee", "numeric"], ["rating", "numeric"], ["is_verified", "bool"]] },
  { id: "specializations", x: 920, y: 300, cols: [["id", "serial", "PK"], ["name", "text", "UQ"], ["slug", "text", "UQ"], ["description", "text"]] },
  { id: "appointments", x: 470, y: 560, cols: [["id", "uuid", "PK"], ["patient_id", "uuid", "FK"], ["doctor_id", "uuid", "FK"], ["scheduled_at", "timestamptz"], ["status", "pending|confirmed|…"], ["reason", "text"], ["doctor_notes", "text"]] },
  { id: "reviews", x: 20, y: 560, cols: [["id", "uuid", "PK"], ["appointment_id", "uuid", "FK"], ["patient_id", "uuid", "FK"], ["doctor_id", "uuid", "FK"], ["rating", "1–5"], ["comment", "text"]] },
  { id: "doctor_schedules", x: 920, y: 560, cols: [["id", "uuid", "PK"], ["doctor_id", "uuid", "FK"], ["day_of_week", "0–6"], ["start_time", "time"], ["end_time", "time"], ["slot_minutes", "int"]] },
];

const T = Object.fromEntries(TABLES.map((t) => [t.id, t]));
const h = (t: Table) => HEAD + t.cols.length * ROW + 8;
type Side = "l" | "r" | "t" | "b";
function anchor(t: Table, side: Side, col?: string) {
  const idx = col ? t.cols.findIndex((c) => c[0] === col) : -1;
  const y = idx >= 0 ? t.y + HEAD + idx * ROW + ROW / 2 + 2 : t.y + h(t) / 2;
  if (side === "l") return [t.x, y];
  if (side === "r") return [t.x + W, y];
  if (side === "t") return [t.x + W / 2, t.y];
  return [t.x + W / 2, t.y + h(t)];
}

// [from table, from col, from side, to table, to side, label]
const RELS: [string, string, Side, string, Side, string][] = [
  ["messages", "conversation_id", "r", "conversations", "l", "N:1"],
  ["conversations", "user_id", "r", "users", "l", "N:1"],
  ["notifications", "user_id", "l", "users", "r", "N:1"],
  ["patients", "user_id", "t", "users", "b", "1:1"],
  ["doctors", "user_id", "t", "users", "b", "1:1"],
  ["doctors", "specialization_id", "r", "specializations", "l", "N:1"],
  ["medical_records", "patient_id", "r", "patients", "l", "N:1"],
  ["appointments", "patient_id", "t", "patients", "b", "N:1"],
  ["appointments", "doctor_id", "t", "doctors", "b", "N:1"],
  ["doctor_schedules", "doctor_id", "t", "doctors", "r", "N:1"],
  ["medical_records", "appointment_id", "b", "appointments", "l", "N:1"],
  ["reviews", "appointment_id", "r", "appointments", "l", "1:1"],
];

function path([x1, y1]: number[], s1: Side, [x2, y2]: number[], s2: Side) {
  const d = 60;
  const off = (s: Side, x: number, y: number) => (s === "l" ? [x - d, y] : s === "r" ? [x + d, y] : s === "t" ? [x, y - d] : [x, y + d]);
  const [c1x, c1y] = off(s1, x1, y1);
  const [c2x, c2y] = off(s2, x2, y2);
  return `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
}

export function Erd() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-3">
      <svg viewBox="0 0 1190 800" className="min-w-[900px]" role="img" aria-label="Database entity relationship diagram">
        <defs>
          <marker id="crow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
            <path d="M0,6 L12,6 M12,0 L12,12" stroke="#0891B2" strokeWidth="1.6" fill="none" />
          </marker>
        </defs>
        {RELS.map(([a, col, s1, b, s2, label], i) => {
          const p1 = anchor(T[a], s1, s1 === "l" || s1 === "r" ? col : undefined);
          const p2 = anchor(T[b], s2);
          const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
          return (
            <g key={i}>
              <path d={path(p1, s1, p2, s2)} fill="none" stroke="#22D3EE" strokeWidth="1.8" strokeOpacity="0.8" markerEnd="url(#crow)" />
              <rect x={mid[0] - 15} y={mid[1] - 9} width="30" height="18" rx="9" stroke="#22D3EE" style={{ fill: "rgb(var(--surface))" }} />
              <text x={mid[0]} y={mid[1] + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0E7490">{label}</text>
            </g>
          );
        })}
        {TABLES.map((t) => (
          <g key={t.id}>
            <rect x={t.x} y={t.y} width={W} height={h(t)} rx="12" style={{ fill: "rgb(var(--surface))", stroke: "rgb(var(--line))" }} />
            <path d={`M${t.x},${t.y + 12} a12,12 0 0 1 12,-12 h${W - 24} a12,12 0 0 1 12,12 v${HEAD - 12} h-${W} z`} fill="#0A1633" />
            <text x={t.x + 14} y={t.y + 22} fontSize="13" fontWeight="700" fill="white" fontFamily="ui-monospace, monospace">{t.id}</text>
            {t.cols.map(([n, type, key], i) => {
              const y = t.y + HEAD + i * ROW + 16;
              return (
                <g key={n}>
                  {key && <text x={t.x + 12} y={y} fontSize="9" fontWeight="800" fill={key === "PK" ? "#D97706" : key === "FK" ? "#0891B2" : "#7C3AED"}>{key}</text>}
                  <text x={t.x + 36} y={y} fontSize="11.5" style={{ fill: "rgb(var(--ink))" }} fontFamily="ui-monospace, monospace" fontWeight={key === "PK" ? 700 : 400}>{n}</text>
                  <text x={t.x + W - 12} y={y} fontSize="10.5" style={{ fill: "rgb(var(--ink-muted))" }} textAnchor="end" fontFamily="ui-monospace, monospace">{type}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
