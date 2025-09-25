import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { headers } from "next/headers"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type UsersResponse = {
  success: boolean
  data: {
    totalCustomers: number
    lastSixMonthsCustomers: number
    percentageLastSixMonths: number
  }
}

type HorsesResponse = {
  success: boolean
  data: Array<{
    id: string
    name: string
    // autres propriétés du cheval
  }>
}

export async function SectionCards() {
  const headerList = await headers()
  const forwardedHost = headerList.get("x-forwarded-host") ?? headerList.get("host")
  const forwardedProto = headerList.get("x-forwarded-proto") ?? "http"

  const envBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""

  const derivedHost = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : envBaseUrl

  const baseUrl = derivedHost || "http://localhost:3000"

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl

  let totalCustomers = 0
  let lastSixMonthsCustomers = 0
  let percentageLastSixMonths = 0
  try {
    const res = await fetch(`${normalizedBaseUrl}/api/user`, {
      next: { revalidate: 0 },
    })

    if (res.ok) {
      const payload = (await res.json()) as UsersResponse
      totalCustomers = payload.data?.totalCustomers ?? 0
      lastSixMonthsCustomers = payload.data?.lastSixMonthsCustomers ?? 0
      percentageLastSixMonths = payload.data?.percentageLastSixMonths ?? 0
    }
  } catch (error) {
    // Ignore network failures; fallback to zero.
  }

  let totalHorses = 0
  try {
    const res = await fetch(`${normalizedBaseUrl}/api/horse`, {
      next: { revalidate: 0 },
    })

    if (res.ok) {
      const payload = (await res.json()) as HorsesResponse
      totalHorses = payload.data?.length ?? 0
    }
  } catch (error) {
    // Ignore network failures; fallback to zero.
  }

  const totalCustomersLabel = new Intl.NumberFormat("fr-FR").format(
    totalCustomers,
  )
  const lastSixMonthsCustomersLabel = new Intl.NumberFormat("fr-FR").format(
    lastSixMonthsCustomers,
  )
  const percentageLastSixMonthsLabel = `${
    percentageLastSixMonths > 0 ? "+" : ""
  }${percentageLastSixMonths}%`
  const totalHorsesLabel = new Intl.NumberFormat("fr-FR").format(totalHorses)

  const isPositiveTrend = percentageLastSixMonths >= 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-6 w-full *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Revenu total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tendance haussiere ce mois-ci <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visiteurs sur les 6 derniers mois
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nouveaux clients (6 mois)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {lastSixMonthsCustomersLabel}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isPositiveTrend ? <IconTrendingUp /> : <IconTrendingDown />}
              {percentageLastSixMonthsLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {lastSixMonthsCustomersLabel} nouvelles inscriptions
            {isPositiveTrend ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {totalCustomersLabel} clients au total
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Chevaux heberges</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalHorsesLabel}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Forte fidelisation <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {totalHorses} chevaux heberges
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Taux de croissance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Progression reguliere des performances <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Respecte les objectifs de croissance</div>
        </CardFooter>
      </Card>
    </div>
  )
}
