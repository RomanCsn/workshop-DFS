import Dashboard from "@/layouts/dashboard";
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
              <TableCaption>Liste de vos factures recentes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Facture</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>Payee</TableCell>
                  <TableCell>Carte de credit</TableCell>
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
