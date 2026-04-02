class HttpException extends Error {
  errorCode: number;
  constructor(
    errorCode: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly message: any,
  ) {
    super(typeof message === 'string' ? message : JSON.stringify(message));
    this.errorCode = errorCode;
  }
}

export default HttpException;
