// Token management utilities (Decoding/Validation only)
// Tokens are stored in memory (Zustand) and httpOnly cookies

export const auth = {
  /**
   * Decode a JWT payload (client-side only — not for security, just for reading claims)
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const base64 = token.split(".")[1];
      const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  /**
   * Check if a token is expired
   */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = this.decodeToken(token);
    if (!payload || typeof payload.exp !== "number") return true;
    return Date.now() / 1000 > payload.exp;
  },
};
