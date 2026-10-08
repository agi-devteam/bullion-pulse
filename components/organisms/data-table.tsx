"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
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
  footer?: ReactNode;
}

export function DataTable({ headers, rows, footer }: DataTableProps) {
  const t = useTranslations("common");

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
                {t("emptyTable")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {footer ? (
        <div className="border-t border-line">{footer}</div>
      ) : null}
    </div>
  );
}
