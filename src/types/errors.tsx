
export class NoMoreDataAvailableError extends Error {
  constructor(message: string = "No more data available") {
    super(message);
    this.name = "NoMoreDataAvailableError";
  }
}

export class NoPostsMadeYet extends Error {
  constructor(message: string = "No posts have been created yet") {
    super(message);
    this.name = "NoPostsMadeYet";
  }
}