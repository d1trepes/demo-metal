import type { ReactNode } from "react";
import s from "./Table.module.css";

export type Column<Row> = {
  key: string;
  title: string;
  /** Числовая колонка: выравнивание вправо, моноширинные цифры. */
  numeric?: boolean;
  render: (row: Row) => ReactNode;
};

type TableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  caption?: string;
};

/** Таблица данных (ТТХ, заказы, документы). Горизонтальная прокрутка внутри себя. */
export function Table<Row>({ columns, rows, rowKey, caption }: TableProps<Row>) {
  return (
    <div className={s.scroller} role="region" aria-label={caption} tabIndex={0}>
      <table className={s.table}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? s.num : undefined}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? s.num : undefined}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
