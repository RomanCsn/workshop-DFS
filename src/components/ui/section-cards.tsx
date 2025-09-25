"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useEffect, useState } from "react"

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

type BillingsResponse = {
  success: boolean
  data: number
}

export function SectionCards() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    lastSixMonthsCustomers: 0,
    percentageLastSixMonths: 0,
    totalHorses: 0,
    totalBillings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch users data
        const usersRes = await fetch('/api/user')
        let userData = { totalCustomers: 0, lastSixMonthsCustomers: 0, percentageLastSixMonths: 0 }
        if (usersRes.ok) {
          const usersPayload = await usersRes.json() as UsersResponse
          userData = {
            totalCustomers: usersPayload.data?.totalCustomers ?? 0,
            lastSixMonthsCustomers: usersPayload.data?.lastSixMonthsCustomers ?? 0,
            percentageLastSixMonths: usersPayload.data?.percentageLastSixMonths ?? 0
          }
        }

        // Fetch horses data
        const horsesRes = await fetch('/api/horse')
        let totalHorses = 0
        if (horsesRes.ok) {
          const horsesPayload = await horsesRes.json() as HorsesResponse
          totalHorses = horsesPayload.data?.length ?? 0
        }

        // Fetch billings data
        const billingsRes = await fetch('/api/billing/count')
        let totalBillings = 0
        if (billingsRes.ok) {
          const billingsPayload = await billingsRes.json() as BillingsResponse
          totalBillings = billingsPayload.data ?? 0
        }

        setStats({
          ...userData,
          totalHorses,
          totalBillings
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
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
  const isPositiveTrend = stats.percentageLastSixMonths >= 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
            <Card className="@container/card">
        <CardHeader>
          <CardDescription>Revenu total</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBillingsLabel}
          </CardTitle>
          <CardAction>
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
