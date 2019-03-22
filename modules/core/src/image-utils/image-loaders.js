/* global Image, Blob, createImageBitmap, btoa */
import {readFile} from '../fetch-file/fetch-file';

// Specifically loads an ImageBitmap (works on newer browser main and worker threads)
export const ImageBitmapLoader = {
  parse: parseToImageBitmap
};

// Specifically loads an HTMLImage (works on alls browser main threads but not on worker threads)
export const HTMLImageLoader = {
  load: loadToHTMLImage
};

// Loads a platform-specific image type that can be used as input data to WebGL textures
export const PlatformImageLoader = {
  parse: parseToPlatformImage,
  load: loadToPlatformImage
};

// TODO - export functions that work on "platform images",
// e.g. extracts image data as typed array from any of the platform image formats.

// Asynchronously parses an array buffer into an ImageBitmap - this contains the decoded data
function parseToImageBitmap(arrayBuffer) {
  const blob = new Blob([new Uint8Array(arrayBuffer)]);
  return createImageBitmap(blob);
}

function loadToHTMLImage(url, options) {
  let promise;
  if (/\.svg((\?|#).*)?$/.test(url)) {
    // is SVG
    promise = readFile(url, {dataType: 'text'})
      // base64 encoding is safer. utf-8 fails in some browsers
      .then(xml => `data:image/svg+xml;base64,${btoa(xml)}`);
  } else {
    promise = Promise.resolve(url);
  }
  return promise.then(
    src =>
      new Promise((resolve, reject) => {
        try {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = err => reject(new Error(`Could not load image ${url}: ${err}`));
          image.crossOrigin = (options && options.crossOrigin) || 'anonymous';
          image.src = src;
        } catch (error) {
          reject(error);
        }
      })
  );
}

function parseToPlatformImage(arrayBuffer) {
  if (typeof createImageBitmap === 'undefined') {
    return null;
  }
  return parseToImageBitmap(arrayBuffer);
}

function loadToPlatformImage(url, options) {
  if (typeof Image === 'undefined') {
    return readFile(url, Object.assign({}, options, {dataType: 'arrayBuffer'})).then(
      parseToPlatformImage
    );
  }
  return loadToHTMLImage(url, options);
}
