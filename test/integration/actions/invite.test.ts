import { describe, expect, it } from "vitest";
import { acceptInvite } from "@/app/invite/[code]/actions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import {
  createCollection,
  createInvite,
  createPermission,
  createUser,
} from "../factories";
import { expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

async function permissionFor(user: { id: string }, collection: { id: number }) {
  return prisma.permission.findUnique({
    where: {
      userId_collectionId: { userId: user.id, collectionId: collection.id },
    },
  });
}

describe("acceptInvite", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await acceptInvite("anything")).toEqual(error("Not signed in"));
  });

  it("rejects a session without an email", async () => {
    const user = await createUser();
    signInAs({ id: user.id, email: null });

    expect(await acceptInvite("anything")).toEqual(
      error("session.email is null or undefined"),
    );
  });

  it("rejects an unknown invite code", async () => {
    signInAs(await createUser());

    expect(await acceptInvite("no-such-code")).toEqual(
      error("Invalid invite code"),
    );
  });

  it("rejects an expired invite", async () => {
    const collection = await createCollection();
    const inviter = await createUser();
    const invite = await createInvite(collection, inviter, {
      expiresAt: new Date(Date.now() - 1000),
    });
    const user = await createUser();
    signInAs(user);

    expect(await acceptInvite(invite.code)).toEqual(
      error("Invite has expired"),
    );
    expect(await permissionFor(user, collection)).toBeNull();
  });

  it("grants the invite's access level and redirects to the collection", async () => {
    const collection = await createCollection();
    const inviter = await createUser();
    const invite = await createInvite(collection, inviter, {
      accessLevel: "ViewOnly",
    });
    const user = await createUser();
    signInAs(user);

    await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);

    expect(await permissionFor(user, collection)).toMatchObject({
      accessLevel: "ViewOnly",
      testsolverType: null,
      seriousTestsolverStartedAt: null,
    });
  });

  it("upgrades an existing permission to the invite's access level", async () => {
    const collection = await createCollection();
    const inviter = await createUser();
    const invite = await createInvite(collection, inviter, {
      accessLevel: "Admin",
    });
    const user = await createUser();
    await createPermission(user, collection, "ViewOnly");
    signInAs(user);

    await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);

    expect((await permissionFor(user, collection))?.accessLevel).toBe("Admin");
    expect(await prisma.permission.count()).toBe(1);
  });

  describe("email domain restriction", () => {
    it("rejects an email outside the domain", async () => {
      const collection = await createCollection();
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter, {
        emailDomain: "mit.edu",
      });
      const user = await createUser({ email: "student@harvard.edu" });
      signInAs(user);

      expect(await acceptInvite(invite.code)).toEqual(
        error("Invalid email domain"),
      );
    });

    it("does not accept a lookalike domain suffix", async () => {
      const collection = await createCollection();
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter, {
        emailDomain: "mit.edu",
      });
      const user = await createUser({ email: "student@notmit.edu" });
      signInAs(user);

      expect(await acceptInvite(invite.code)).toEqual(
        error("Invalid email domain"),
      );
    });

    it("accepts an email in the domain", async () => {
      const collection = await createCollection();
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter, {
        emailDomain: "mit.edu",
      });
      const user = await createUser({ email: "student@mit.edu" });
      signInAs(user);

      await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);
      expect(await permissionFor(user, collection)).not.toBeNull();
    });
  });

  describe("one-time-use invites", () => {
    it("expires after the first accept", async () => {
      const collection = await createCollection();
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter, {
        oneTimeUse: true,
      });
      const first = await createUser();
      const second = await createUser();

      signInAs(first);
      await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);
      const used = await prisma.invite.findUniqueOrThrow({
        where: { code: invite.code },
      });
      expect(used.expiresAt).not.toBeNull();

      signInAs(second);
      expect(await acceptInvite(invite.code)).toEqual(
        error("Invite has expired"),
      );
      expect(await permissionFor(second, collection)).toBeNull();
    });

    it("a reusable invite keeps working", async () => {
      const collection = await createCollection();
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter, {
        oneTimeUse: false,
      });

      for (let i = 0; i < 2; i++) {
        signInAs(await createUser());
        await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);
      }
      expect(await prisma.permission.count()).toBe(2);
    });
  });

  describe("collections that force serious testsolving", () => {
    it.each(["topsoj", "mgci"])(
      "makes new members of %s serious testsolvers from the collection's creation",
      async (cid) => {
        const collection = await createCollection({ cid });
        const inviter = await createUser();
        const invite = await createInvite(collection, inviter);
        const user = await createUser();
        signInAs(user);

        await expectRedirect(acceptInvite(invite.code), `/c/${cid}`);

        expect(await permissionFor(user, collection)).toMatchObject({
          testsolverType: "Serious",
          seriousTestsolverStartedAt: collection.createdAt,
        });
      },
    );

    it("leaves the testsolver type unset for other collections", async () => {
      const collection = await createCollection({ cid: "topsoj-2" });
      const inviter = await createUser();
      const invite = await createInvite(collection, inviter);
      const user = await createUser();
      signInAs(user);

      await expectRedirect(acceptInvite(invite.code), `/c/${collection.cid}`);

      expect(
        (await permissionFor(user, collection))?.testsolverType,
      ).toBeNull();
    });
  });
});
