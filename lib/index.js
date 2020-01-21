var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import * as Mp4Box from 'mp4box';
export const DEFAULT_OPTIONS = {
    maxWidth: 1280,
    maxHeight: 720,
    supportedMimeTypes: ['video/mp4'],
    supportedVideoCodecs: [/^avc1\.42e0/, /^avc1\.4d40/, /^avc1\.6400/],
    supportedAudioCodecs: ['mp4a.40.2', 'mp4a.40.5'],
};
const loadBuffer = (blob) => new Promise(function (resolve, reject) {
    const fileReader = new FileReader();
    fileReader.onload = function (evt) {
        if (!evt.target) {
            reject(new Error('File could not be read'));
        }
        else if (evt.target.error) {
            reject(evt.target.error);
        }
        else {
            resolve(evt.target.result);
        }
    };
    fileReader.readAsArrayBuffer(blob);
});
function loadChunks(file, chunkSize = 64 * 1024) {
    return __asyncGenerator(this, arguments, function* loadChunks_1() {
        const fileSize = file.size;
        let offset = 0;
        while (offset <= fileSize) {
            const chunkBlob = file.slice(offset, chunkSize + offset);
            const chunkData = yield __await(loadBuffer(chunkBlob));
            chunkData.fileStart = offset;
            yield yield __await(chunkData);
            offset += chunkData.byteLength;
        }
    });
}
const matchesOne = (candidateValue, testValues) => {
    return testValues.some((testCase) => {
        if (testCase instanceof RegExp) {
            return testCase.test(candidateValue);
        }
        else {
            return candidateValue === testCase;
        }
    });
};
const isMatch = (info, options) => {
    const tracks = info.tracks;
    return tracks.every(track => {
        if (track.type === 'video') {
            const isSupportedCodec = matchesOne(track.codec, options.supportedVideoCodecs);
            const isSupportedWidth = track.video.width <= options.maxWidth;
            const isSupportedHeight = track.video.height <= options.maxHeight;
            return isSupportedCodec && isSupportedWidth && isSupportedHeight;
        }
        else if (track.type === 'audio') {
            return matchesOne(track.codec, options.supportedAudioCodecs);
        }
        else {
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
export const checkMp4File = (file, options = DEFAULT_OPTIONS) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    if (!file || !matchesOne(file.type, options.supportedMimeTypes)) {
        return false;
    }
    const box = Mp4Box.createFile();
    let result = null;
    box.onReady = info => {
        result = info;
    };
    try {
        for (var _b = __asyncValues(loadChunks(file)), _c; _c = yield _b.next(), !_c.done;) {
            const chunk = _c.value;
            box.appendBuffer(chunk);
            if (result) {
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (result === null) {
        return false;
    }
    else {
        return isMatch(result, options);
    }
});
