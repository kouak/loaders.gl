import '@loaders.gl/polyfills';
import {parseSLPK} from '@loaders.gl/i3s';
import {FileHandleProvider} from '@loaders.gl/tile-converter';
import path from 'path';

let slpkArchive;

const loadArchive = async (fullLayerPath) => {
  slpkArchive = await parseSLPK(await FileHandleProvider.from(fullLayerPath));
};

const I3S_LAYER_PATH = process.env.I3sLayerPath || ''; // eslint-disable-line no-process-env, no-undef
const FULL_LAYER_PATH = path.join(process.cwd(), I3S_LAYER_PATH); // eslint-disable-line no-undef

loadArchive(FULL_LAYER_PATH);

export async function getFileByUrl(url) {
  const trimmedPath = /^\/?(.*)\/?$/.exec(url);
  let uncompressedFile;
  if (trimmedPath) {
    try {
      uncompressedFile = Buffer.from(await slpkArchive.getFile(trimmedPath[1], 'http'));
    } catch (e) {}
  }
  return uncompressedFile;
}