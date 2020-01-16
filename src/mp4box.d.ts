declare module 'mp4box' {
  interface IReference {
    type: string;
    track_ids: number[];
  }

  interface ITrack {
    id: number;
    name: string;
    references: IReference[];
    created: string;
    modified: string;
    movie_duration: number;
    layer: number;
    alternate_group: number;
    volume: number;
    matrix: number[];
    track_width: number;
    track_height: number;
    timescale: number;
    duration: number;
    bitrate: number;
    codec: string;
    language: string;
    nb_samples: number;
    type: 'audio' | 'video' | 'subtitles' | 'metadata';
  }

  interface IAudioTrack extends ITrack {
    type: 'audio';
    audio: {
      sample_rate: number;
      channel_count: number;
      sample_size: number;
    };
  }

  interface IVideoTrack extends ITrack {
    type: 'video';
    video: {
      width: number;
      height: number;
    };
  }
  
  export interface IMovie {
    hasMoov?: boolean;
    mime: string;
    duration: number;
    timescale: number;
    isFragmented: boolean;
    isProgressive: boolean;
    hasIOD: boolean;
    brands: string[];
    created: string;
    modified: string;
    tracks: Array<IAudioTrack | IVideoTrack>;
    audioTracks: IAudioTrack[];
    videoTracks: IVideoTrack[];
  }

  class IsoFile {
    constructor(stream: any);
    appendBuffer(ab: ArrayBuffer, last?: boolean): number;
    onReady(info: IMovie): void;
  }
  export function createFile (): IsoFile;
}
