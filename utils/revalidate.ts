export async function revalidateTags(tags: string[]) {
  const escapedTags = tags.map((tag) => encodeURIComponent(tag));
  await fetch(
    `${process.env.NEXTAUTH_URL}/api/revalidateTags?tag=${escapedTags.join(
      "&tag=",
    )}`,
    { cache: "no-store" },
  );
}
