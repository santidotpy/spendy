import { redirect } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { userId } = await auth();
  // const user = await currentUser()
  // console.log(user?.firstName)

  // if (!userId) {
  //   redirect("/sign-in");
  // }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log("session", session);
  // if (!session) {
  //   return <div>Not authenticated</div>;
  // }
  return (
    <SidebarProvider>
      <AppSidebar user={session?.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        {/* Optional Header could go here if needed */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
