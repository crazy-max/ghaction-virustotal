import {lstatSync, readFileSync} from 'fs';
import {getType} from 'mime';
import {basename, posix} from 'path';
import axios, {AxiosInstance} from 'axios';
import * as FormData from 'form-data';
import * as core from '@actions/core';
import { stringify } from 'querystring';

const fetch = require("node-fetch");

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
      // baseURL: 'https://www.virustotal.com/api/v3',
      baseURL: '',
      headers: {
        'x-apikey': apiKey ?? ''
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
  }

  async getURL(): Promise<string>{
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-apikey': '34dc81f56bf2322a14ab2f46da736e1cade7c7da37cf7cf3387f904ece5380bf'
        }
    };
    return await fetch('https://www.virustotal.com/api/v3/files/upload_url', options)
        .then(response => response.json())
        .then(response => {
        return JSON.stringify(response.data);
  
    })
  };

  async files(filename: string): Promise<UploadData> {
    const {name, mime, size, file} = asset(filename);
    const fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });


    const largeFileURL: string = await this.getURL();

    return this.instance
      // .post('/files', fd.getBuffer(), {
      .post(largeFileURL, fd.getBuffer(), {
        headers: fd.getHeaders()
      })
      .then(upload => {
        const data = upload.data.data as UploadData;
        data.url = `https://www.virustotal.com/gui/file-analysis/${data.id}/detection`;
        return data;
      })
      .catch(error => {
        throw new Error(`Cannot send ${name} to VirusTotal: ${error}`);
      });
  }

  monitorItems(filename: string, path?: string): Promise<UploadData> {
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

    return this.instance
      .post('/monitor/items', fd.getBuffer(), {
        headers: fd.getHeaders()
      })
      .then(upload => {
        const data = upload.data.data as UploadData;
        data.url = `https://www.virustotal.com/monitor/analyses/item:${data.id}`;
        return data;
      })
      .catch(error => {
        throw new Error(`Cannot send ${name} to VirusTotal Monitor at ${itemPath}: ${error}`);
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
