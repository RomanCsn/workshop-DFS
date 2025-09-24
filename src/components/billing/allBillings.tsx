"use client";
import { useEffect, useState } from 'react';

export default function AllBillings({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
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

  return (
    <div>
      <h1>Data from API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>{userId}</p>
    </div>
  );
}