# mp4filechecker

```
npm install mp4filechecker
```

Checks a File or Blob to determine if it is an mp4 file matching a particular codec and dimensions.

Usage:
```javascript
import { checkMp4File } from 'mp4filechecker';

const file = fileOrBlob; // e.g. fileInput.files[0]

const options = {
  maxWidth: 1280,
  maxHeight: 720,
  supportedMimeTypes: ['video/mp4'],
  supportedVideoCodecs: [/^avc1\.42e0/, /^avc1\.4d40/, /^avc1\.6400/],
  supportedAudioCodecs: ['mp4a.40.2', 'mp4a.40.5'],
};

if (checkMp4File(file, options)) {
  // file matches the given options
}
```

## Inspiration

I was initially trying to use [ffmpeg.js](https://github.com/Kagami/ffmpeg.js/) to transcode the video in the browser to a desired resolution and level of compression when a user selects a video to upload (e.g. using a file input). This would alleviate the need to use server-side video compression/transcoding, or a potentially costly cloud transcoding service. Unfortunately using this method was too slow for my purposes, so the next idea I had was to use the browser to just detect if the video was already in an acceptable format (i.e. compressed using a well-supported codec and not too large in its dimensions). If the video was already acceptable, then the transcoding could be skipped. Only videos which did not meet these criteria would then be transcoded, ultimately reducing the processing costs of server-side/cloud transcoding.

After trawling github/stackoverflow for ideas, looking up [information about browser support for various containers/codecs on Wikipedia](https://en.wikipedia.org/wiki/HTML5_video#Browser_support), and playing with [this helpful tool](https://cconcolato.github.io/media-mime-support/), I decided that (at the time of writing) there are only a few viable options for delivering video via the web:

- Using MP4 with any of the AVC1/H.264 video codecs, and either the mp4a.40.2 or mp4a.40.5 audio codecs
- Using WebM with the VP8 or VP9 video codec, and either the opus or vorbis audio codecs

(N.B. AV1 for both containers is also gaining popularity, but not as widely supported)

The main issue with WebM is that it's not supported on iOS/Safari (and pre-Edge Internet Explorer, for those to whom that still matters). This leaves MP4 as the only truely viable one-size-fits-all uploadable format for video files.

This library therefore targets the MP4 file, using the [GPAC MP4Box JS port](https://github.com/gpac/mp4box.js) to parse the Mp4 file information, checking it against a list of sanctioned audio/video codecs, and ensuring the video's dimensions are within maximum bounds.

Given a video file passes this test, there can be some level of certainty that the video will not require transcoding for it to effectively and functionally be served on the web.
