import { api } from "~/trpc/server";
import DashboardGraphs from "~/components/dashboard-graphs";

export default async function Page() {
  const data = await api.transactions.getAll();
  return (
    <main className="container mx-auto p-4">
      <DashboardGraphs transactions={data} />
    </main>
  );
}
