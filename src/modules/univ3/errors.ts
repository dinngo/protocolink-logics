export const UNSUPPORTED_TOKEN_ERROR = new Error('UNSUPPORTED_TOKEN');

export function isUnsupportedTokenError(err: any) {
  return err === UNSUPPORTED_TOKEN_ERROR;
}
