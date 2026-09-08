/**
 * An invite expires at `expiresAt`. One-time invites are expired by setting
 * it to the moment they were accepted; a null value never expires.
 */
export function isInviteExpired(
  invite: { expiresAt: Date | null },
  now: Date = new Date(),
): boolean {
  return invite.expiresAt !== null && invite.expiresAt <= now;
}
