export interface BaseMetadata {
    device?: Device;
    os?: OS;
    appVersion?: string;
    schemaVersion?: number; // for evolution
}
export type Device = "mobile" | "desktop" | "tablet" | undefined;
export type OS = "iOS" | "Android" | "Windows" | "MacOS" | "Linux" | "Unknown";

export interface PostLikedMetadata extends BaseMetadata {
    postId: string;
    referrer: "home" | "fastdraw";
    authorId?: string;
    scrollPosition?: number; // e.g. 0.72
}

export interface PostCreatedMetadata extends BaseMetadata {
    postId: string;
    authorId?: string;
}

export interface PostImpressionMetadata extends BaseMetadata {
    postId: string;
    referrer: "home" | "fastdraw";
    visibleDuration?: number; // in seconds
    positionInFeed?: number;
}

export interface PostClickThroughMetadata extends BaseMetadata {
    postId: string;
    positionInFeed?: number;
}

export interface ErrorOccurredMetadata extends BaseMetadata {
  errorMessage: string;
  errorCode?: string | number;
  endpoint?: string;
  stack?: string;
  isFatal?: boolean;
}

export interface LatencyMeasuredMetadata extends BaseMetadata {
  endpoint: string;
  durationMs: number;
  statusCode?: number;
}

export interface AppCrashedMetadata extends BaseMetadata {
  screen?: string;
  appVersion?: string;
  stackTrace?: string;
}
