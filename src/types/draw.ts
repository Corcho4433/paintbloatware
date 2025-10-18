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
    action : string,
    data : {
        frame : Frame,
        message: string,
        previewReady: boolean,
        urlBucket: string,
    }
}

export type Frame = {
    frame_id: number;
    frame_data: number[][];
}