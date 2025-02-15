import React from "react";
import "../styles/Table.css";

interface TableColumn {
  title: string;
  key: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
  headerProps?: React.HTMLAttributes<HTMLTableCellElement>;
}

interface TableItem {
  [key: string]: any;
}

interface TableProps {
  columns: TableColumn[];
  items: TableItem[];
  className?: string; //Para pasarle distintos estilos
}

function Table({ columns, items, className }: TableProps) {
  const [hoveredColumn, setHoveredColumn] = React.useState<string | null>(null);

  return (
    <div className="table-div">
      <table className={`table ${className || ""}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)} // Key MUST be a string
                {...column.headerProps}
                onMouseEnter={() => setHoveredColumn(String(column.key))}
                onMouseLeave={() => setHoveredColumn(null)}
                className={`${column.sortable ? "table-header-sortable" : ""} ${
                  hoveredColumn === String(column.key)
                    ? "table-header-hover"
                    : ""
                }`}
                style={{
                  ...column.headerProps?.style, // Spread existing styles FIRST
                  textAlign: "center", // Conditional alignment
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tfoot>
          {/* TODO: Ver si dejar esta fila */}
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)} // Key MUST be a string
                {...column.headerProps}
                onMouseEnter={() => setHoveredColumn(String(column.key))}
                onMouseLeave={() => setHoveredColumn(null)}
                className={`${column.sortable ? "table-header-sortable" : ""} ${
                  hoveredColumn === String(column.key)
                    ? "table-header-hover"
                    : ""
                }`}
                style={{
                  ...column.headerProps?.style, // Spread existing styles FIRST
                  textAlign: "center", // Conditional alignment
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </tfoot>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className={item.isSelected ? "is-selected" : ""}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    textAlign:
                      column.key === "actions"
                        ? "center"
                        : typeof item[column.key] === "number"
                        ? "right"
                        : "left",
                  }}
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

// Ejemplo de uso
// const columns: Column[] = [
//     { title: 'Pos', key: 'pos' },
//     { title: 'Team', key: 'team', render: (item) => <a href={item.teamLink} title={item.team}>{item.team} {item.isChampion ? <strong>(C)</strong> : ''}</a> },
//     { title: 'Pld', key: 'pld' },
//     { title: 'W', key: 'w' },
//     { title: 'D', key: 'd' },
//     { title: 'L', key: 'l' },
//     { title: 'GF', key: 'gf' },
//     { title: 'GA', key: 'ga' },
//     { title: 'GD', key: 'gd' },
//     { title: 'Pts', key: 'pts' },
//     { title: 'Qualification or relegation', key: 'qualification', render: (item) => <>{item.qualification} {item.relegationLink && <a href={item.relegationLink}>{item.relegation}</a>}</> },
//   ];

//   const items: Item[] = [
//     { pos: 1, team: 'Leicester City', teamLink: 'https://en.wikipedia.org/wiki/Leicester_City_F.C.', pld: 38, w: 23, d: 12, l: 3, gf: 68, ga: 36, gd: '+32', pts: 81, qualification: 'Qualification for the', relegation: 'Champions League group stage', relegationLink: 'https://en.wikipedia.org/wiki/2016%E2%80%9317_UEFA_Champions_League#Group_stage', isChampion: true },
//     { pos: 2, team: 'Arsenal', teamLink: 'https://en.wikipedia.org/wiki/Arsenal_F.C.', pld: 38, w: 20, d: 11, l: 7, gf: 65, ga: 36, gd: '+29', pts: 71, qualification: 'Qualification for the', relegation: 'Champions League group stage', relegationLink: 'https://en.wikipedia.org/wiki/2016%E2%80%9317_UEFA_Champions_League#Group_stage', isSelected: false },
//     // ... more items
//     { pos: 20, team: 'Aston Villa', teamLink: 'https://en.wikipedia.org/wiki/Aston_Villa_F.C.', pld: 38, w: 3, d: 8, l: 27, gf: 27, ga: 76, gd: '-49', pts: 17, qualification: 'Relegation to the', relegation: 'Football League Championship', relegationLink: 'https://en.wikipedia.org/wiki/2016%E2%80%9317_Football_League_Championship', isSelected: false },

//   ];

//   const MyTableComponent: React.FC = () => {
//     return (
//       <Table columns={columns} items={items} className="is-striped" /> // Example with Bulma styling
//     );
//   };
