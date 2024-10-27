import Sidebar from "@/components/sidebar";

export default function NeedPermissionPage() {
  return (
    <Sidebar>
      <div className="mx-auto my-24 w-128">
        <h1 className="mb-8 text-3xl">You need permission</h1>
        <p className="text-xl">
          Ask for access, or switch to an account with permission.
        </p>
      </div>
    </Sidebar>
  );
}
