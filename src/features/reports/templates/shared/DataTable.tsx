import { colors } from './docStyles';

type Props = {
  headers?: string[];
  rows?: string[][];
  dense?: boolean;
};

export function DataTable({ headers = [], rows = [], dense }: Props) {
  if (!headers.length && !rows.length) {
    return (
      <div style={{ fontSize: 10, color: colors.muted, padding: 8, border: `1px dashed ${colors.line}` }}>
        No table rows in bound context
      </div>
    );
  }
  const fontSize = dense ? 9 : 10;
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize,
        marginBottom: 8,
      }}
    >
      {headers.length ? (
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  background: colors.wash,
                  border: `1px solid ${colors.line}`,
                  padding: dense ? '3px 5px' : '5px 7px',
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody>
        {(rows.length ? rows : [['—']]).map((row, i) => (
          <tr key={i}>
            {(headers.length ? headers.map((_, j) => row[j] ?? '') : row).map((cell, j) => (
              <td
                key={j}
                style={{
                  border: `1px solid ${colors.line}`,
                  padding: dense ? '3px 5px' : '5px 7px',
                  verticalAlign: 'top',
                }}
              >
                {cell || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
