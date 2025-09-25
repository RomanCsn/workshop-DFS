"use client";
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AllBillings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/billing`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;

  if (!userId) return <p>Aucun utilisateur trouve</p>;

  const rows = (data?.data ?? []).flatMap((billing: any) =>
    (billing.services ?? []).map((svc: any) => ({
      billingId: billing.id,
      date: new Date(billing.date).toLocaleDateString(),
      serviceType: svc.serviceType,
      amount: svc.amount,
      userEmail: svc.user?.email || 'N/A',
    }))
  );

  return (
    <div>
      <h1>Toutes les factures pour : {userId}</h1>
      <Table className="w-full">
        <TableCaption>Factures de l'utilisateur courant</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="text-right">Telecharger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row: any) => (
            <TableRow key={`${row.billingId}-${row.serviceType}-${row.date}`}>
              <TableCell className="font-medium">{row.billingId}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.userEmail}</TableCell>
              <TableCell>{row.serviceType}</TableCell>
              <TableCell className="text-right">{row.amount}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `/api/billing/pdf?billingId=${encodeURIComponent(row.billingId)}`,
                      '_blank'
                    )
                  }
                  onClick={() => {}}
                >
                  Telecharger le PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>Aucune facture disponible</TableCell>

            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
