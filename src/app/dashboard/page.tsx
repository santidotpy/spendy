

export default function DashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6">
        <p className="text-muted-foreground">
          Welcome to your dashboard! Use the sidebar to navigate through different sections.
        </p>
      </div>
    </div>
  );
}
