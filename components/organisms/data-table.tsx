import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/organisms/table";

export interface DataTableProps {
  headers: string[];
  rows: ReactNode[][];
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="table-wrap max-w-full overflow-auto rounded-2xl border border-line">
      <Table className="border-collapse text-left">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={headers.length}
                className="px-8 py-8 text-center whitespace-normal text-muted-text"
              >
                Tidak ada data yang sesuai.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
