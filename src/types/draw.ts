export interface processorRequest {
    action : processorAction,
    data : {source: string},
}

export enum processorAction {
    ProcessSourceCode,
    PostToBucket,
    RenderPreview,
}

export enum processorServerResponse {
    FrameData,
    Error,
    UploadSuccess,
    PreviewReady,
}

export interface processorResponse {
    action : processorServerResponse,
    data : {
        frame : Frame,
        error: string,
        errorCode: number,
        previewReady: boolean,
        postUrl: string,
    }
}

export type Frame = {
    frame_id: number;
    frame_data: number[][];
}