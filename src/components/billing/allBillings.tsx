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
<<<<<<< HEAD
  }, []);
=======
  });
>>>>>>> fb5d7b5 (feat: management billing admin or not and added in sidebar)

  if (loading) return <p>Loading...</p>;

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
      <h1>All Billings</h1>
      <Table className="w-full">
        <TableCaption>All billings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Billing</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Download</TableHead>
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
                  onClick={() => {}}
                >
                  Download PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>No billings found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}