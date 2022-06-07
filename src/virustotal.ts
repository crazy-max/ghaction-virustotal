import {lstatSync, readFileSync} from 'fs';
import {getType} from 'mime';
import {basename, posix} from 'path';
import axios, {AxiosInstance} from 'axios';
import * as FormData from 'form-data';
import * as core from '@actions/core';
import { stringify } from 'querystring';

// const fetch = require("node-fetch");

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
  private largeURL: string = '';

  async getURL(apiKey: string | undefined): Promise<string>{
    let instance: AxiosInstance = axios.create({
      baseURL: '',
      headers: {
        Accept: 'application/json',
        'x-apikey': apiKey ?? ''
      }
    });
  
    return await instance.get('https://www.virustotal.com/api/v3/files/upload_url',)
                          .then((res) => {return res.data.data});
  };

  async getLargeFileURL(apiKey: string | undefined){
    this.largeURL = await this.getURL(apiKey);
  };

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

  files(filename: string): Promise<UploadData> {
    const {name, mime, size, file} = asset(filename);
    const fd = new FormData();
    fd.append('file', file, {
      filename: name,
      contentType: mime,
      knownLength: size
    });


    return this.instance
      // .post("https://www.virustotal.com/_ah/upload/AMmfu6bjFpYSuvz-GRwQ68VROSg6hjjuS61sXILRj2ELPCj6Qv4ZFIjPlvuRvgkysxu7NeiyRpVWJbnRjqntdFG-gJqGRy82ZjleRJhQCFt_GNvmPM8eAP4lnEKYeOjx5jeymCs-6v0wa8X4vsK0MaW-QoYDGBquAhIpZ-KuOoGQk2daBr57TslL5E6U39521G-w1AaEYytIMgVTSEWwpPjPCwjRB6W5bTVVsqpEnAUNP_h7ve3iGGc40jMVMZ544ttk91xpc4N9O0zq0NorVH1LCCQMo6YBieCLBofnwKB-Knt7P5r9cj8L0_DLauKt_Nh2lSaQhQv0O7G2sFj9bpURXUkQyhXiYHPxGK77MqinesRLJ8R3y9fTNBWhzafbnmJHSXGUv_1kPTgLdD6JCCXO4gt-ySTTJaPCeLasuKM8jsbRFVMNq87xFEk8W155BEgV70sfbDr8FN6BT8_c-dH_qdF9KWPbePQQm36dWbn4p_POviByf2yPE9OezI10zObKVXpUffkg3RnbTih7M6lEhquoOrvgNQrm9UWKCsTW9TFCThUi3pCmZ_AgIY95vHLfJgAaVTwH6x7HThI5yObQrDMZQmmzi3P095RkNy8crf4P_gwtJzMjXpysgCtosFAXSJ5du49zp4ep_6ixjANUrIKEFOx3Fw3OHTLkS9fHS8KJKKNcJvdjXhowcEqQ4IIZVNt79nBlPSJ5XMKggGKx_I7GlSdWOlczgNkdsiEyZ9Qrt0Ad7pz2o6ToCB2lrhV-9_sJdQVEoSKNxhrD-tb9n2mIfMFGz5w0nw2fngt3VGNKUkoqIpPKb4OU6XK6E-XMBvuOjSh1fu0W3Nu-Sr-puJeaRL7CTc1JQsYMCAu1OSo-LsLjPDTYy_gqK5wOXMD-hHVQsuazZ3wLv4mDyNFuOqGGufqyJxYsNWsRmNUlPU2dLDcvtDcd53oLNTn1v0-2t64xytYwnMUFpja2gO9EQWhxx0shXFRO2wdi19HnJ1b0tyFX4SQ629RW82PCPdRukEwopSffyOtp3RyDw89-zy1eyNvbVYJgV4GqwYrkcCgmhTHl_4AEVomq-D-Npz4UkdG3_0vwhvllblo1glofOySLmUQAELatmGeRJEtyc_TzajsCYy_hXnIfTjPnAmUiqtKDz7KZv_4br_WYlSDDF0FfW82Kt_6DDIOqyNqQjiAIkxlp99XgLWMok3sBDv2LZnmhQB8qMguL_gV1Q_aSVNQ_nw1ZnQ/ALBNUaYAAAAAYp_E5QbSg3wVomaxoBdkXe11IZBUNEfP/", fd.getBuffer(), {
      .post(this.largeURL, fd.getBuffer(), {
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
