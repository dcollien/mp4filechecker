import * as Mp4Box from 'mp4box';

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

interface IArrayBufferChunk extends ArrayBuffer {
  fileStart?: number;
}

export const DEFAULT_OPTIONS: IOptions = {
  maxWidth: 1280,
  maxHeight: 720,
  supportedMimeTypes: ['video/mp4'],
  supportedVideoCodecs: [/^avc1\.42e0/, /^avc1\.4d40/, /^avc1\.6400/],
  supportedAudioCodecs: ['mp4a.40.2', 'mp4a.40.5'],
};

const loadBuffer = (blob: Blob) =>
  new Promise<IArrayBufferChunk>(function(resolve, reject) {
    const fileReader = new FileReader();
    fileReader.onload = function(evt) {
      if (!evt.target) {
        reject(new Error('File could not be read'));
      } else if (evt.target.error) {
        reject(evt.target.error);
      } else {
        resolve(evt.target.result as IArrayBufferChunk);
      }
    };
    fileReader.readAsArrayBuffer(blob);
  });

async function* loadChunks(file: Blob, chunkSize = 64 * 1024) {
  const fileSize = file.size;

  let offset = 0;
  while (offset <= fileSize) {
    const chunkBlob = file.slice(offset, chunkSize + offset);
    const chunkData = await loadBuffer(chunkBlob);
    chunkData.fileStart = offset;
    yield chunkData;
    offset += chunkData.byteLength;
  }
}

const matchesOne = (candidateValue: string, testValues: Array<string | RegExp>): boolean => {
  return testValues.some((testCase: string | RegExp) => {
    if (testCase instanceof RegExp) {
      return testCase.test(candidateValue);
    } else {
      return candidateValue === testCase;
    }
  });
};

const isMatch = (info: Mp4Box.IMovie, options: IOptions): boolean => {
  const tracks = info.tracks;

  return tracks.every(track => {
    if (track.type === 'video') {
      const isSupportedCodec = matchesOne(track.codec, options.supportedVideoCodecs);
      const isSupportedWidth = track.video.width <= options.maxWidth;
      const isSupportedHeight = track.video.height <= options.maxHeight;
      return isSupportedCodec && isSupportedWidth && isSupportedHeight;
    } else if (track.type === 'audio') {
      return matchesOne(track.codec, options.supportedAudioCodecs);
    } else {
      return true;
    }
  });
};

/**
 * Checks whether an mp4 video file matches the provided criteria.
 *
 * @param file The provided mp4 video as a File or Blob
 * @param options The video/audio track options which need to match
 *
 * @returns Promise.resolved(true) when the mp4 file matches the criteria provided in options, Promise.resolved(false) otherwise.
 */
export const checkMp4File = async (file: Blob, options = DEFAULT_OPTIONS): Promise<boolean> => {
  if (!file || !matchesOne(file.type, options.supportedMimeTypes)) {
    return false;
  }

  const box = Mp4Box.createFile();

  let result = null;
  box.onReady = info => {
    result = info;
  };

  for await (const chunk of loadChunks(file)) {
    box.appendBuffer(chunk);
    if (result) {
      break;
    }
  }

  if (result === null) {
    return false;
  } else {
    return isMatch(result, options);
  }
};
