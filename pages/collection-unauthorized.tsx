import Sidebar from '@/components/sidebar';

export default function CollectionUnauthorized() {
  return (
    <Sidebar>
      <div className="text-xl w-128 mx-auto my-24">
        You do not have permission to view this collection. Ask the owner for an invite link.
      </div>
    </Sidebar>
  );
}
