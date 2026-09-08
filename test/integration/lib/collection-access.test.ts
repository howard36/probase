import { describe, expect, it } from "vitest";
import {
  getAuthorIds,
  getPermission,
  requireCollectionAccess,
} from "@/lib/collection-access";
import {
  createAuthor,
  createCollection,
  createPermission,
  createUser,
} from "../factories";
import { expectNotFound, expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

describe("getPermission", () => {
  it("returns the user's permission row for the collection, or null", async () => {
    const collection = await createCollection();
    const user = await createUser();
    expect(await getPermission(user.id, collection.id)).toBeNull();

    const permission = await createPermission(user, collection, "ViewOnly");
    expect(await getPermission(user.id, collection.id)).toEqual(permission);
  });
});

describe("getAuthorIds", () => {
  it("returns only the user's authors in that collection", async () => {
    const collection = await createCollection();
    const other = await createCollection();
    const user = await createUser();
    const mine = await createAuthor(collection, { userId: user.id });
    await createAuthor(other, { userId: user.id });
    await createAuthor(collection);

    expect(await getAuthorIds(user.id, collection.id)).toEqual([
      { id: mine.id },
    ]);
  });
});

describe("requireCollectionAccess", () => {
  it("404s for an unknown collection, even when signed out", async () => {
    signOut();
    await expectNotFound(requireCollectionAccess("nope", "/c/nope"));
  });

  it("redirects a signed-out user to sign-in, returning to the callback path", async () => {
    const collection = await createCollection();
    signOut();
    await expectRedirect(
      requireCollectionAccess(collection.cid, `/c/${collection.cid}`),
      `/api/auth/signin?callbackUrl=%2Fc%2F${collection.cid}`,
    );
  });

  it("redirects a user with no permission row to /need-permission", async () => {
    const collection = await createCollection();
    signInAs(await createUser());
    await expectRedirect(
      requireCollectionAccess(collection.cid, "/x"),
      "/need-permission",
    );
  });

  it("redirects a SubmitOnly user, who cannot view the collection", async () => {
    const collection = await createCollection();
    const user = await createUser();
    await createPermission(user, collection, "SubmitOnly");
    signInAs(user);
    await expectRedirect(
      requireCollectionAccess(collection.cid, "/x"),
      "/need-permission",
    );
  });

  it("returns the collection, permission, authors and user for a member", async () => {
    const collection = await createCollection();
    const user = await createUser();
    const permission = await createPermission(user, collection, "TeamMember");
    const author = await createAuthor(collection, { userId: user.id });
    signInAs(user);

    const access = await requireCollectionAccess(collection.cid, "/x");

    expect(access.userId).toBe(user.id);
    expect(access.collection).toEqual(collection);
    expect(access.permission).toEqual(permission);
    expect(access.authors).toEqual([{ id: author.id }]);
  });

  describe("collections that require testsolving", () => {
    it("sends a member who has not chosen a testsolver type to the chooser", async () => {
      const collection = await createCollection({ requireTestsolve: true });
      const user = await createUser();
      await createPermission(user, collection, "TeamMember");
      signInAs(user);

      await expectRedirect(
        requireCollectionAccess(collection.cid, "/x"),
        `/c/${collection.cid}/choose-testsolver-type`,
      );
    });

    it("lets a member through once they have chosen a type", async () => {
      const collection = await createCollection({ requireTestsolve: true });
      const user = await createUser();
      await createPermission(user, collection, "TeamMember", {
        testsolverType: "Casual",
      });
      signInAs(user);

      const access = await requireCollectionAccess(collection.cid, "/x");
      expect(access.permission.testsolverType).toBe("Casual");
    });

    it("skips the chooser redirect when asked, for the chooser page itself", async () => {
      const collection = await createCollection({ requireTestsolve: true });
      const user = await createUser();
      await createPermission(user, collection, "TeamMember");
      signInAs(user);

      const access = await requireCollectionAccess(collection.cid, "/x", {
        skipTestsolverTypeCheck: true,
      });
      expect(access.permission.testsolverType).toBeNull();
    });

    it("does not redirect members of collections without testsolving", async () => {
      const collection = await createCollection({ requireTestsolve: false });
      const user = await createUser();
      await createPermission(user, collection, "TeamMember");
      signInAs(user);

      const access = await requireCollectionAccess(collection.cid, "/x");
      expect(access.permission.testsolverType).toBeNull();
    });
  });
});
