import { describe, expect, it } from "vitest";
import InvitePage from "@/app/invite/[code]/page";
import AlreadyJoined from "@/app/invite/[code]/already-joined";
import InviteJoinPage from "@/app/invite/[code]/invite-join-page";
import {
  createCollection,
  createInvite,
  createPermission,
  createUser,
} from "../factories";
import { signInAs } from "../session";

async function render(code: string) {
  return (await InvitePage({ params: Promise.resolve({ code }) })) as {
    type: unknown;
    props: Record<string, unknown>;
  };
}

describe("invite page", () => {
  it.each([
    ["ViewOnly", "SubmitOnly", "/c/{cid}"],
    ["SubmitOnly", "ViewOnly", "/c/{cid}/add-problem"],
    ["TeamMember", "ViewOnly", "/c/{cid}"],
  ] as const)(
    "shows a %s member a %s invite as already joined, linking to their start",
    async (current, invited, homePath) => {
      const collection = await createCollection();
      const invite = await createInvite(collection, await createUser(), {
        accessLevel: invited,
      });
      const member = await createUser();
      await createPermission(member, collection, current);
      signInAs(member);

      const page = await render(invite.code);

      expect(page.type).toBe(AlreadyJoined);
      expect(page.props.homePath).toBe(
        homePath.replace("{cid}", collection.cid),
      );
    },
  );

  it("offers an invite that raises a member's access", async () => {
    const collection = await createCollection();
    const invite = await createInvite(collection, await createUser(), {
      accessLevel: "TeamMember",
    });
    const member = await createUser();
    await createPermission(member, collection, "ViewOnly");
    signInAs(member);

    expect((await render(invite.code)).type).toBe(InviteJoinPage);
  });
});
