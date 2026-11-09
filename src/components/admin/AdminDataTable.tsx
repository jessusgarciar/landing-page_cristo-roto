import type { ComponentChildren } from 'preact';

interface Props {
  columns: string[];
  rows: { cells: ComponentChildren[]; key: string }[];
  emptyMessage?: string;
}

export default function AdminDataTable({ columns, rows, emptyMessage }: Props) {
  if (rows.length === 0) {
    return (
      <div style={{
        background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
        padding: '48px', textAlign: 'center',
      }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          {emptyMessage || 'No hay datos disponibles'}
        </p>
      </div>
    );
  }

  return (
    <div class="admin-table-scroll" style={{
      background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
      overflow: 'auto',
    }}>
      <table class="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'rgba(15,23,42,.5)' }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase',
                letterSpacing: '.5px', borderBottom: '1px solid #334155',
                whiteSpace: 'nowrap',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} style={{ borderBottom: '1px solid #1e293b' }}>
              {row.cells.map((cell, i) => (
                <td key={i} style={{
                  padding: '12px 16px', color: '#e2e8f0', verticalAlign: 'middle',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
