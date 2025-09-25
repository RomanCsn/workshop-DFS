"use client";
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AllBillings({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/billing?userId=${encodeURIComponent(userId)}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  if (!userId) return <p>No user found</p>;

  const rows = (data?.data ?? []).flatMap((billing: any) =>
    (billing.services ?? []).map((svc: any) => ({
      billingId: billing.id,
      date: new Date(billing.date).toLocaleDateString(),
      serviceType: svc.serviceType,
      amount: svc.amount,
    }))
  );

  return (
    <div>
      <h1>All Billings user : {userId}</h1>
      <Table className="w-full">
        <TableCaption>Billings for current user</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Billing</TableHead>
            <TableHead>Date</TableHead>
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
              <TableCell>{row.serviceType}</TableCell>
              <TableCell className="text-right">{row.amount}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/api/billing/pdf?billingId=${encodeURIComponent(row.billingId)}`, '_blank')}
                >
                  Download PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>No billings found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
