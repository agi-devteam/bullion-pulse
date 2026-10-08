"use client";

import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/organisms/table";

export interface DataTableSkeletonProps {
  /** Real header labels keep column widths aligned with loaded content. */
  headers: string[];
  rowCount?: number;
}

/** Matches `DataTable` chrome: same wrap, header row, and cell padding. */
export function DataTableSkeleton({
  headers,
  rowCount = 8,
}: DataTableSkeletonProps) {
  return (
    <div
      className="table-wrap max-w-full overflow-auto rounded-2xl border border-line"
      aria-hidden="true"
    >
      <Table className="border-collapse text-left">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-transparent">
              {headers.map((header, cellIndex) => (
                <TableCell key={`${header}-${cellIndex}`}>
                  <Skeleton
                    className={
                      cellIndex === 0
                        ? "h-4 w-28"
                        : cellIndex === headers.length - 1
                          ? "h-9 w-20 rounded-[999px]"
                          : "h-4 w-16"
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
