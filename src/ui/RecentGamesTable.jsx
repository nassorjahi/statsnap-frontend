// src/ui/RecentGamesTable.jsx
import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";

export default function RecentGamesTable({ rows }) {
  const columns = useMemo(
    () => [
      { Header: "Date", accessor: "date" },
      { Header: "Opponent", accessor: "opponent" },
      { Header: "Result", accessor: "result" },
      { Header: "Team PTS", accessor: "teamPts" },
      { Header: "Opp PTS", accessor: "oppPts" },
      { Header: "FG%", accessor: "fgPct" },
      { Header: "3P%", accessor: "threePct" },
      { Header: "REB", accessor: "reb" },
      { Header: "AST", accessor: "ast" },
      { Header: "TO", accessor: "tov" },
    ],
    []
  );

  const table = useTable({ columns, data: rows }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows: tr, prepareRow } = table;

  return (
    <div className="table-wrap">
      <table {...getTableProps()} className="table">
        <thead>
          {headerGroups.map((hg) => (
            <tr {...hg.getHeaderGroupProps()} key={hg.id}>
              {hg.headers.map((col) => (
                <th {...col.getHeaderProps(col.getSortByToggleProps())} key={col.id}>
                  {col.render("Header")}
                  <span className="sort-ind">{col.isSorted ? (col.isSortedDesc ? " ▼" : " ▲") : ""}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {tr.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id} className="row-hover">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.column.id}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
