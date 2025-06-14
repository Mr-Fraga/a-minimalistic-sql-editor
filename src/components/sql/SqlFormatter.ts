
/**
 * Basic SQL formatter: uppercases keywords and formats main SQL clauses.
 */
export function simpleSqlFormat(sql: string): string {
  if (!sql) return "";
  const keywords = [
    "select",
    "from",
    "where",
    "order by",
    "group by",
    "limit",
    "insert",
    "update",
    "delete",
    "values",
    "set",
  ];
  let formatted = sql;
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, kw.toUpperCase());
  });
  formatted = formatted.replace(
    /\b(FROM|WHERE|ORDER BY|GROUP BY|LIMIT|INSERT|UPDATE|DELETE|VALUES|SET)\b/g,
    "\n$1"
  );
  formatted = formatted.replace(/\n{2,}/g, "\n");
  formatted = formatted.trim();
  if (!formatted.endsWith(";")) formatted += ";";
  return formatted;
}
