import {lstatSync, readFileSync} from 'fs';
import {getType} from 'mime';
import {basename} from 'path';
import axios, {AxiosInstance} from 'axios';
import * as FormData from 'form-data';

interface UploadData {
  id: string;
  type: string;
  url: string;
}

interface AnalysisMetaFileInfo {
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

  upload(filepath: string): Promise<UploadData> {
    const {name, mime, size, file} = asset(filepath);
    let fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });

    return this.instance
      .post('/files', fd.getBuffer(), {
        headers: {
          ...this.instance.defaults.headers,
          ...fd.getHeaders()
        }
      })
      .then(upload => {
        const data = upload.data.data as UploadData;
        data.url = `https://www.virustotal.com/gui/file-analysis/${data.id}/detection`;
        return data;
      });
  }

  analysis(id: string): Promise<AnalysisMetaFileInfo> {
    return this.instance.get(`/analyses/${id}`).then(analysis => {
      return analysis.data.data.file_info as AnalysisMetaFileInfo;
    });
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
