# Changelog

## 3.1.0 (2022/06/26)

* Support rate limiting (#124 #129)
* Set collapsible assets in release body (#128)
* Large file upload support (#127)
* Bump @actions/core from 1.6.0 to 1.9.0 (#126)
* Bump @actions/github from 5.0.1 to 5.0.3 (#123)
* Bump axios from 0.26.1 to 0.27.2 (#117)

## 3.0.0 (2022/05/26)

* Node 16 as default runtime (#113)
  * This requires a minimum [Actions Runner](https://github.com/actions/runner/releases/tag/v2.285.0) version of v2.285.0, which is by default available in GHES 3.4 or later.

## 2.5.0 (2022/05/26)

* Update dev dependencies and workflow (#111)
* Handle latest Octokit definitions (#78)
* Fix setOutput (#87)
* Use `core.getBooleanInput` (#86)
* Fix inputs and release event
* Bump @actions/core from 1.2.6 to 1.6.0 (#76 #82 #91)
* Bump @actions/github from 5.0.0 to 5.0.1 (#112)
* Bump axios from 0.21.1 to 0.26.1 (#84 #85 #106)
* Bump mime from 2.4.7 to 3.0.0 (#67 #95)
* Bump node-fetch from 2.6.1 to 2.6.7 (#104)
* Bump follow-redirects from 1.14.3 to 1.14.9 (#105)
* Bump minimist from 1.2.5 to 1.2.6 (#107)
* Bump ansi-regex from 5.0.0 to 5.0.1 (#90)
* Bump tmpl from 1.0.4 to 1.0.5 (#89)
* Bump path-parse from 1.0.6 to 1.0.7 (#81)
* Bump form-data from 3.0.0 to 4.0.0 (#66)
* Bump y18n from 4.0.0 to 4.0.3 (#70)
* Bump hosted-git-info from 2.8.8 to 2.8.9 (#72)
* Bump lodash from 4.17.20 to 4.17.21 (#71)
* Bump ws from 7.3.0 to 7.4.6 (#77)

## 2.4.1 (2021/01/06)

* Fix error output

## 2.4.0 (2020/12/22)

* Fix maxBodyLength limit (#64)
* Bump node-notifier from 8.0.0 to 8.0.1 (#63)
* Bump axios from 0.21.0 to 0.21.1 (#62)
* Bump mime from 2.4.6 to 2.4.7 (#61)
* JSON stringify Axios error response

## 2.3.0 (2020/12/12)

* Enhanced error messages output
* Bump node-fetch from 2.6.0 to 2.6.1 (#59)
* Bump lodash from 4.17.15 to 4.17.20 (#58)
* Bump axios from 0.19.2 to 0.21.0 (#56)

## 2.2.1 (2020/10/01)

* Fix CVE-2020-15228

## 2.2.0 (2020/07/22)

* Handle [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github) v4
* Update deps

## 2.1.2 (2020/06/07)

* Fix pattern matcher for GitHub releases

## 2.1.1 (2020/06/06)

* Update README

## 2.1.0 (2020/06/06)

* Add support for VirusTotal Monitor
* Update deps

## 2.0.1 (2020/05/20)

* Fix README

## 2.0.0 (2020/05/20)

* Move `VT_API_KEY` and `GITHUB_TOKEN` env vars to `vt_api_key` and `github_token` inputs

## 1.3.0 (2020/05/20)

* Add `update_release_body` input to append analysis link(s) to the release body
* Update deps

## 1.2.0 (2020/05/11)

* More tests
* Update deps

## 1.1.1 (2020/05/01)

* More screenshots

## 1.1.0 (2020/05/01)

* Allow to scan assets of a published release
* Add output analysis

## 1.0.0 (2020/04/29)

* Initial version
