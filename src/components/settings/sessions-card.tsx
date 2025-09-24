import { headers } from 'next/headers'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'

import { SessionsClientCard, type SessionPreview } from './sessions-client-card'

type SessionsCardProps = {
  currentSessionToken: string | null
}

export async function SessionsCard({ currentSessionToken }: SessionsCardProps) {
  const headerList = await headers()

  let sessions: SessionPreview[] = []

  try {
    const data = await auth.api.listSessions({ headers: headerList })

    sessions = data.map((session) => ({
      token: session.token,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      ipAddress: session.ipAddress ?? 'Unknown location',
      userAgent: session.userAgent ?? 'Unknown device',
      isCurrent: session.token === currentSessionToken,
    }))
  } catch (error) {
    console.error('SessionsCard', error)
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Sign out from devices you no longer use. The list refreshes automatically after each change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionsClientCard sessions={sessions} />
      </CardContent>
    </Card>
  )
}
