import createLogger from "~/utils/createLogger";

describe("createLogger", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it("should return a logger with info, warn, error, and debug methods", () => {
    const logger = createLogger("TestContext");
    expect(logger).toHaveProperty("info");
    expect(logger).toHaveProperty("warn");
    expect(logger).toHaveProperty("error");
    expect(logger).toHaveProperty("debug");
  });

  it("should suppress all log output when NODE_ENV is test", () => {
    process.env.NODE_ENV = "test";
    const infoSpy = jest.spyOn(console, "info").mockImplementation();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    const debugSpy = jest.spyOn(console, "debug").mockImplementation();

    const logger = createLogger("Silent");
    logger.info("msg");
    logger.warn("msg");
    logger.error("msg", new Error("e"));
    logger.debug("msg");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("should write info logs outside of test env", () => {
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "info").mockImplementation();

    const logger = createLogger("Info");
    logger.info("hello");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("[INFO]");
    expect(spy.mock.calls[0][0]).toContain("[Info]");
    expect(spy.mock.calls[0][0]).toContain("hello");
  });

  it("should write warn logs outside of test env", () => {
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "warn").mockImplementation();

    const logger = createLogger("Warn");
    logger.warn("caution");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("[WARN]");
    expect(spy.mock.calls[0][0]).toContain("caution");
  });

  it("should write error logs outside of test env", () => {
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "error").mockImplementation();

    const logger = createLogger("Err");
    const err = new Error("boom");
    logger.error("something broke", err);

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain("[ERROR]");
    expect(spy.mock.calls[0][0]).toContain("something broke");
  });

  it("should only write debug logs in development", () => {
    process.env.NODE_ENV = "production";
    const spy = jest.spyOn(console, "debug").mockImplementation();

    const logger = createLogger("Debug");
    logger.debug("dev-only");

    expect(spy).not.toHaveBeenCalled();
  });

  it("should write debug logs in development env", () => {
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "debug").mockImplementation();

    const logger = createLogger("Debug");
    logger.debug("dev-only");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("[DEBUG]");
  });

  it("should include metadata in log output", () => {
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "info").mockImplementation();

    const logger = createLogger("Meta");
    logger.info("with meta", { userId: "123" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("userId");
  });
});
