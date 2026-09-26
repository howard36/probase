import Sidebar from "@/components/sidebar";
import { SwitchAccountButton } from "@/components/account-buttons";
import { getCurrentUser } from "@/lib/current-user";

export default async function NeedPermissionPage() {
  const user = await getCurrentUser();
  return (
    <Sidebar signedInAs={user?.email ?? null}>
      <div className="mx-auto my-24 w-128 max-w-full px-8">
        <h1 className="mb-8 text-3xl">You need permission</h1>
        <p className="mb-8 text-xl">
          Ask for access, or switch to an account with permission.
        </p>
        {user !== null && (
          <SwitchAccountButton callbackPath="/" label="Switch account" />
        )}
      </div>
    </Sidebar>
  );
}
