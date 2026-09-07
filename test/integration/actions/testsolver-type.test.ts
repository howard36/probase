import { describe, expect, it } from "vitest";
import { setTestsolverType } from "@/app/c/[cid]/choose-testsolver-type/actions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import { createCollection, createPermission, createUser } from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

describe("setTestsolverType", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await setTestsolverType(1, "Casual")).toEqual(
      error("Not signed in"),
    );
  });

  it("404s for an unknown collection", async () => {
    signInAs(await createUser());

    await expectNotFound(setTestsolverType(999, "Casual"));
  });

  it("rejects a user with no permission on the collection", async () => {
    const collection = await createCollection({ requireTestsolve: true });
    signInAs(await createUser());

    expect(await setTestsolverType(collection.id, "Casual")).toEqual(
      error("You do not have access to this collection"),
    );
  });

  it.each(["Casual", "Serious"] as const)(
    "records the %s choice, dated from the collection's creation, and redirects",
    async (type) => {
      const collection = await createCollection({ requireTestsolve: true });
      const user = await createUser();
      await createPermission(user, collection, "TeamMember");
      signInAs(user);

      await expectRedirect(
        setTestsolverType(collection.id, type),
        `/c/${collection.cid}`,
      );

      const permission = await prisma.permission.findUniqueOrThrow({
        where: {
          userId_collectionId: { userId: user.id, collectionId: collection.id },
        },
      });
      expect(permission).toMatchObject({
        accessLevel: "TeamMember",
        testsolverType: type,
        seriousTestsolverStartedAt: collection.createdAt,
      });
    },
  );

  it("only changes the calling user's permission", async () => {
    const collection = await createCollection({ requireTestsolve: true });
    const user = await createUser();
    const other = await createUser();
    await createPermission(user, collection);
    await createPermission(other, collection);
    signInAs(user);

    await expectRedirect(
      setTestsolverType(collection.id, "Serious"),
      `/c/${collection.cid}`,
    );

    const otherPermission = await prisma.permission.findUniqueOrThrow({
      where: {
        userId_collectionId: { userId: other.id, collectionId: collection.id },
      },
    });
    expect(otherPermission.testsolverType).toBeNull();
  });
});
