"use client";
import { useEffect, useState } from 'react';

export default function ClientSideFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const billingId = 'ba8d5a4f-f6f3-428f-aa58-38ec46e00055';
  

  useEffect(() => {
    fetch(`/api/billing?id=${billingId}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Data from API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}