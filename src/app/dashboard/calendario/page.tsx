import DarkSubscriptionCalendarDemo from "~/app/dashboard/calendario/dark-subscription-calendar-demo"
import { api } from "~/trpc/server"

export default async function Page() {
  const data = await api.transactions.getAll();
  return <DarkSubscriptionCalendarDemo transactions={data} />
}
