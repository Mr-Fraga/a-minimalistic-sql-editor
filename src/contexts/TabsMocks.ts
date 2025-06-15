
export const MOCK_SQL = `SELECT * FROM users LIMIT 10;`;

export const MOCK_RESULT = {
  columns: ["id", "name", "email", "phone", "country_code"],
  rows: [
    [1, "Alice", "alice@email.com", "555-0100", "US"],
    [2, "Bob", "bob@email.com", "555-0101", "CA"],
    [3, "Charlie", "charlie@email.com", "555-0102", "UK"],
    [4, "David", "david@email.com", "555-0103", "AU"],
    [5, "Eva", "eva@email.com", "555-0104", "DE"],
    [6, "Frank", "frank@email.com", "555-0105", "FR"],
    [7, "Grace", "grace@email.com", "555-0106", "ES"],
    [8, "Hannah", "hannah@email.com", "555-0107", "IT"],
    [9, "Ian", "ian@email.com", "555-0108", "NL"],
    [10, "Julia", "julia@email.com", "555-0109", "CH"],
    [11, "Kyle", "kyle@email.com", "555-0110", "AT"],
    [12, "Luna", "luna@email.com", "555-0111", "SE"],
    [13, "Maya", "maya@email.com", "555-0112", "NO"],
    [14, "Noah", "noah@email.com", "555-0113", "DK"],
    [15, "Olivia", "olivia@email.com", "555-0114", "FI"],
  ]
};

export const DEFAULT_TAB = {
  name: "Initial Tab",
  sql: MOCK_SQL,
  result: MOCK_RESULT,
  error: null,
  isRunning: false,
  comment: "",
};
