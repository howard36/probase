import { Prisma } from "@prisma/client";

export const inviteInclude = {
  collection: {
    select: {
      cid: true,
      name: true,
    },
  },
  inviter: {
    select: { name: true },
  },
};
const inviteProps = Prisma.validator<Prisma.InviteDefaultArgs>()({
  include: inviteInclude,
});
export type InviteProps = Prisma.InviteGetPayload<typeof inviteProps>;
