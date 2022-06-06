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
      .post('https://www.virustotal.com/_ah/upload/AMmfu6bZje23uFZ-eaMBPOlNYjYR9MGQDIzxaXq-jQizeeVtYqDir1Cd55_qjrirSfaNhc0b6R4EqURy8UBg_gEPHQCmyd5WVhOvFuBqMUapouq9qyUpTfyOVFX_Q48Zmpe4oK9YEM9xKJ0ed3pOi0RgQ7R53gTrMc4LQGaLm5YFoi1gcvpWG5rydexRd-QVrpw0oalSwZp6a3Q9ks1-xLWMcAxsnljVgT1VMe0c6hYkqmIP_nXMPXUMm9NjSU-EtKldspFhuDrN_2qdTsSEwhEK9Jywb9L-vwtByi3T76D1jHA-AEtnReVaW8TiwK_Rq93AdxuLbxQt7aVVou0GlcQLhARvQuaXH3EE7MK4qZR9dEdlZiDCezHOdcuBp2BYJbVfxsxq8lohqp-Pmy7c5njkHU3mGkE67Rb_zdveXpAAUvG8X_ZqvVJR-NKbZpQ9QVCcmPeKG4kLwd4ywca2N4PQpMF_-D9MdXWVSeAnuOOmnjZvKYFT1JGKiZPLQ_2hpdjEp_tDF6EmXZ1I4TmW1k-QE22nwKgmSXqa6_LGX6SQ0utvMl6FC0jb6_SjlHZ2gK4QTHMoTLYyCkkgZGYRYCdDqpCrxVuNRvUqkg0l-DFMScrDtFkDvpM3DWmmT_mKMWVjPzlPEvH12Cg9nultNsoIDFGsnk-fSid_TtHn0Qq11ZzR6rCrXIV5t9wzm9-_0IXQV-rxYLIDSTUABf__Nw203sF-Jmjm7xexJyWnyi0Pbs3vLlpsw_5m1usmZxWbjPXqKC_RupJ7ysKCJ4hD58lJcE4kwLFuFBqONL6MFOiLbODNWjcJJ5K4zTWEddjD_NfJb9KwLGmlv30A0GWT6yZvmC2NH4Wbuq3XiW-GV1MNjk97crVEGr-o7cwkC2hAcBn1cmWkEjofH-iEFQUMi428z_HqDbMzDk4zLA-l73_NuX6HD42MzeQvyTDNTH8GLhiVifdpE7WRDvm0eM6bwQ1pKZCSdpBwFvQlFZmBjEBoZpKJIuS0VHOKgFkzoxpQlWExPEZ8gLHxYUYF8Mukirnt4dwcZS-IdA/ALBNUaYAAAAAYp6RgWu1_MAfWlyqItwBMgYHFICntB2L/', fd.getBuffer(), {
      // .post(largeFileURL, fd.getBuffer(), {
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
