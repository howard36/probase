import Sidebar from '@/components/sidebar';

export default function NeedPermissionPage() {
  return (
    <Sidebar>
      <div className="w-128 mx-auto my-24">
        <h1 className="text-3xl mb-8">You need permission</h1>
        <p className="text-xl">Ask for access, or switch to an account with permission.</p>
      </div>
    </Sidebar>
  );
}
