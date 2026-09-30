import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { orgId } = await auth.protect();
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="font-mono text-sm text-gray-500">org: {orgId}</p>
    </main>
  );
}
