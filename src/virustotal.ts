import {lstatSync, readFileSync} from 'fs';
import {getType} from 'mime';
import {basename} from 'path';
import axios, {AxiosInstance, AxiosPromise} from 'axios';
import * as FormData from 'form-data';

interface IUploadModel {
  data: IUploadData;
}

interface IUploadData {
  id: string;
  type: string;
}

interface IAnalysisModel {
  meta: IAnalysisDataMeta;
}

interface IAnalysisDataMeta {
  file_info: IAnalysisDataFileInfo;
}

interface IAnalysisDataFileInfo {
  md5: string;
  sha1: string;
  sha256: string;
  size: number;
}

export interface Asset {
  name: string;
  mime: string;
  size: number;
  file: Buffer;
}

export class VirusTotal {
  private instance: AxiosInstance;

  constructor(apiKey: string | undefined) {
    this.instance = axios.create({
      baseURL: 'https://www.virustotal.com/api/v3',
      headers: {
        'x-apikey': apiKey
      }
    });
  }

  upload(filepath: string | undefined): AxiosPromise<IUploadModel> {
    if (!filepath) {
      throw new Error('Missing asset filepath');
    }

    let {name, size, mime, file} = asset(filepath);

    let fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });

    return this.instance.post('/files', fd.getBuffer(), {
      headers: {
        ...this.instance.defaults.headers,
        ...fd.getHeaders()
      }
    });
  }

  analysis(id: string | undefined): AxiosPromise<IAnalysisModel> {
    if (!id) {
      throw new Error('Missing analysis ID');
    }
    return this.instance.get(`/analyses/${id}`);
  }
}

export const asset = (path: string): Asset => {
  return {
    name: basename(path),
    mime: mimeOrDefault(path),
    size: lstatSync(path).size,
    file: readFileSync(path)
  };
};

export const mimeOrDefault = (path: string): string => {
  return getType(path) || 'application/octet-stream';
};
