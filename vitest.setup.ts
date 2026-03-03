import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {vi} from 'vitest';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghaction-virustotal-'));

process.env = Object.assign({}, process.env, {
  TEMP: tmpDir,
  RUNNER_TEMP: path.join(tmpDir, 'runner-temp'),
  RUNNER_TOOL_CACHE: path.join(tmpDir, 'runner-tool-cache')
});

vi.mock('@actions/github', async () => {
  const actual = await vi.importActual<typeof import('@actions/github')>('@actions/github');
  return {
    ...actual,
    context: {
      repo: {
        owner: 'portapps',
        repo: 'brave-portable'
      },
      eventName: 'push',
      ref: 'refs/heads/master',
      runId: 911271838,
      runNumber: 1,
      payload: {
        after: '411b28b73d17742f4afd55a46ef2c7483a760e5f',
        base_ref: null,
        before: '8c7ad624f3de94e75410d30add4544a401e2d32a',
        compare: 'https://github.com/portapps/brave-portable/compare/8c7ad624f3de...411b28b73d17',
        created: false,
        deleted: false,
        forced: false,
        ref: 'refs/heads/master',
        commits: [
          {
            id: '411b28b73d17742f4afd55a46ef2c7483a760e5f',
            message: 'Dump context',
            timestamp: '2021-06-06T10:29:21+02:00',
            tree_id: '67fc290b8438de3c56fad0ec5abd0ba9fb2be878',
            url: 'https://github.com/portapps/brave-portable/commit/411b28b73d17742f4afd55a46ef2c7483a760e5f',
            distinct: true,
            author: {
              email: 'crazy-max@users.noreply.github.com',
              name: 'CrazyMax',
              username: 'crazy-max'
            },
            committer: {
              email: 'crazy-max@users.noreply.github.com',
              name: 'CrazyMax',
              username: 'crazy-max'
            }
          }
        ],
        head_commit: {
          id: '411b28b73d17742f4afd55a46ef2c7483a760e5f',
          message: 'Dump context',
          timestamp: '2021-06-06T10:29:21+02:00',
          tree_id: '67fc290b8438de3c56fad0ec5abd0ba9fb2be878',
          url: 'https://github.com/portapps/brave-portable/commit/411b28b73d17742f4afd55a46ef2c7483a760e5f',
          distinct: true,
          author: {
            email: 'crazy-max@users.noreply.github.com',
            name: 'CrazyMax',
            username: 'crazy-max'
          },
          committer: {
            email: 'crazy-max@users.noreply.github.com',
            name: 'CrazyMax',
            username: 'crazy-max'
          }
        },
        organization: {
          id: 33734063,
          login: 'portapps',
          description: 'Collection of portable apps for Windows',
          url: 'https://api.github.com/orgs/portapps',
          repos_url: 'https://api.github.com/orgs/portapps/repos',
          events_url: 'https://api.github.com/orgs/portapps/events',
          hooks_url: 'https://api.github.com/orgs/portapps/hooks',
          issues_url: 'https://api.github.com/orgs/portapps/issues',
          members_url: 'https://api.github.com/orgs/portapps/members{/member}',
          public_members_url: 'https://api.github.com/orgs/portapps/public_members{/member}',
          avatar_url: 'https://avatars.githubusercontent.com/u/33734063?v=4',
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjMzNzM0MDYz'
        },
        pusher: {
          name: 'crazy-max',
          email: '1951866+crazy-max@users.noreply.github.com'
        },
        repository: {
          id: 90169309,
          name: 'brave-portable',
          full_name: 'portapps/brave-portable',
          private: false,
          html_url: 'https://github.com/portapps/brave-portable',
          clone_url: 'https://github.com/portapps/brave-portable.git',
          default_branch: 'master',
          language: 'Go',
          open_issues: 5,
          open_issues_count: 5,
          stargazers_count: 143,
          watchers_count: 143,
          forks_count: 14,
          owner: {
            id: 33734063,
            login: 'portapps',
            type: 'Organization',
            name: 'portapps',
            email: 'contact@portapps.io',
            html_url: 'https://github.com/portapps',
            avatar_url: 'https://avatars.githubusercontent.com/u/33734063?v=4',
            site_admin: false
          }
        },
        sender: {
          id: 1951866,
          login: 'crazy-max',
          type: 'User',
          html_url: 'https://github.com/crazy-max',
          avatar_url: 'https://avatars.githubusercontent.com/u/1951866?v=4',
          site_admin: false
        }
      }
    }
  };
});
