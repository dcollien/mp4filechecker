export interface IOptions {
    /**
     * Maximum width (pixels) of the video frames
     */
    maxWidth: number;
    /**
     * Maximum height (pixels) of the video frames
     */
    maxHeight: number;
    /**
     * Array of supported mime types
     * as either strings to match (verbatim), or regex to test against.
     */
    supportedMimeTypes: Array<string | RegExp>;
    /**
     * Array of supported video codec names of the form {major brand}.{minor brand}
     * as either strings to match (verbatim), or regex to test against.
     */
    supportedVideoCodecs: Array<string | RegExp>;
    /**
     * Array of supported audio codec names of the form {major brand}.{minor brand}
     * as either strings to match (verbatim), or regex to test against.
     */
    supportedAudioCodecs: Array<string | RegExp>;
}
export declare const DEFAULT_OPTIONS: IOptions;
/**
 * Checks whether an mp4 video file matches the provided criteria.
 *
 * @param file The provided mp4 video as a File or Blob
 * @param options The video/audio track options which need to match
 *
 * @returns Promise.resolved(true) when the mp4 file matches the criteria provided in options, Promise.resolved(false) otherwise.
 */
export declare const checkMp4File: (file: Blob, options?: IOptions) => Promise<boolean>;
