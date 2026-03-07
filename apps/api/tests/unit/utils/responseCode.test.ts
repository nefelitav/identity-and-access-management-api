import { ResponseCode } from "~/utils/responseCode";
describe("ResponseCode", () => {
  it("should define standard HTTP status codes", () => {
    expect(ResponseCode.OK).toBe(200);
    expect(ResponseCode.CREATED).toBe(201);
    expect(ResponseCode.NO_CONTENT).toBe(204);
    expect(ResponseCode.BAD_REQUEST).toBe(400);
    expect(ResponseCode.UNAUTHORIZED).toBe(401);
    expect(ResponseCode.FORBIDDEN).toBe(403);
    expect(ResponseCode.NOT_FOUND).toBe(404);
    expect(ResponseCode.METHOD_NOT_ALLOWED).toBe(405);
    expect(ResponseCode.CONFLICT).toBe(409);
    expect(ResponseCode.UNPROCESSABLE_ENTITY).toBe(422);
    expect(ResponseCode.TOO_MANY_REQUESTS).toBe(429);
    expect(ResponseCode.INTERNAL_SERVER_ERROR).toBe(500);
    expect(ResponseCode.BAD_GATEWAY).toBe(502);
  });
});
