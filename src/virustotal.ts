import {lstatSync, readFileSync} from 'fs';
import {getType} from 'mime';
import {basename, posix} from 'path';
import axios, {AxiosInstance} from 'axios';
import FormData from 'form-data';
import * as core from '@actions/core';

interface UploadData {
  id: string;
  type: string;
  url: string;
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
        'x-apikey': apiKey ?? ''
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
  }

  public async files(filename: string): Promise<UploadData> {
    const {name, mime, size, file} = asset(filename);
    const fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });

    return this.instance
      .post(
        size < 32 * 1024 * 1024
          ? '/files'
          : await this.instance.get('/files/upload_url').then(res => {
              return res.data.data;
            }),
        fd.getBuffer(),
        {
          headers: fd.getHeaders()
        }
      )
      .then(upload => {
        const data = upload.data.data as UploadData;
        data.url = `https://www.virustotal.com/gui/file-analysis/${data.id}/detection`;
        return data;
      })
      .catch(error => {
        throw new Error(`Cannot send ${name} to VirusTotal: ${error}`);
      });
  }

  public async monitorItems(filename: string, path?: string): Promise<UploadData> {
    const {name, mime, size, file} = asset(filename);
    const fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });

    const itemPath: string = posix.join(path ? path : '/', name);
    core.debug(`monitorItems path: ${itemPath}`);
    fd.append('path', itemPath);

    try {
      const upload = await this.instance.post('/monitor/items', fd.getBuffer(), {
        headers: fd.getHeaders()
      });
      const data = upload.data.data as UploadData;
      data.url = `https://www.virustotal.com/monitor/analyses/item:${data.id}`;
      return data;
    } catch (error) {
      throw new Error(`Cannot send ${name} to VirusTotal Monitor at ${itemPath}: ${error}`);
    }
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
