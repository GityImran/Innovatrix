import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export default function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div style={s.container}>
      <table style={s.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={s.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={keyExtractor(item)} style={s.tr}>
                {columns.map((col, index) => (
                  <td key={index} style={s.td}>
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={s.noData}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.875rem",
  },
  th: {
    padding: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "#94a3b8",
    fontWeight: 600,
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  td: {
    padding: "1rem",
    color: "#f8fafc",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  tr: {
    transition: "background-color 0.15s ease",
  },
  noData: {
    padding: "2rem",
    textAlign: "center",
    color: "#64748b",
  },
};
