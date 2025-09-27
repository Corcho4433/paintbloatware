
export class NoMoreDataAvailableError extends Error {
  constructor(message: string = "No more data available") {
    super(message);
    this.name = "NoMoreDataAvailableError";
  }
}
