import { hashToken } from "~/utils/hashToken";
import crypto from "crypto";

describe("hashToken", () => {
  it("should return a SHA-256 hex digest", () => {
    const result = hashToken("my-secret-token");
    const expected = crypto
      .createHash("sha256")
      .update("my-secret-token")
      .digest("hex");

    expect(result).toBe(expected);
  });

  it("should produce consistent output for the same input", () => {
    const a = hashToken("token123");
    const b = hashToken("token123");

    expect(a).toBe(b);
  });

  it("should produce different output for different inputs", () => {
    const a = hashToken("token-a");
    const b = hashToken("token-b");

    expect(a).not.toBe(b);
  });

  it("should return a 64-character hex string", () => {
    const result = hashToken("anything");

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});
