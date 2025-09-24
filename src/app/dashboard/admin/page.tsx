import Dashboard from "@/layouts/dashboard";
import { getCurrentUser }  from "@/lib/session";
import { SectionCards } from "@/components/ui/section-cards";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar01 } from "@/components/ui/calendar";

export default async function Page() {

  return (
    <Dashboard>
      <div className="w-full space-y-6 flex-1">
        <div className="w-full">
          <SectionCards />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="w-full">
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="w-full">
            <Calendar01 />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
