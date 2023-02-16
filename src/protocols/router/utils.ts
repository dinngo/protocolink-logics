export function getDeadline(expiration: number) {
  return Math.floor(Date.now() / 1000) + expiration;
}
