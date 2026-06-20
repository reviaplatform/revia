import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  showAction?: boolean;
}

export function TableRowsSkeleton({
  columnCount,
  rowCount = 5,
  showAction = true,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-border/40">
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </TableCell>
          ))}
          {showAction && (
            <TableCell className="text-right pr-6">
              <Skeleton className="h-8 w-8 ml-auto rounded-sm" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
}

export function TableSkeleton({
  columnCount,
  rowCount = 5,
  showAction = true,
}: TableSkeletonProps) {
  return (
    <div className="rounded-md border border-border/50 bg-card overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-border/50">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-3 w-20" />
              </TableHead>
            ))}
            {showAction && <TableHead className="text-right pr-6" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRowsSkeleton 
            columnCount={columnCount} 
            rowCount={rowCount} 
            showAction={showAction} 
          />
        </TableBody>
      </Table>
    </div>
  );
}
