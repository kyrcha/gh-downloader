require('dotenv').config()
const Octokit = require('@octokit/rest')
const rp = require('request-promise')
const fs = require('fs')
const ora = require('ora')
const makeDir = require('make-dir')

function throwErr (msg) {
  throw new Error(msg)
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))

const githubToken = process.env.GITHUB_TOKEN || throwErr('GITHUB_TOKEN is unset')
const progLang = process.env.PROGRAMMING_LANGUAGE || throwErr('PROGRAMMING_LANGUAGE is unset')
const starsQuery = process.env.STARS_QUERY || throwErr('STARS_QUERY is unset')
const repos = process.env.REPOS || throwErr('REPOS is unset')
const outputDir = process.env.OUTPUT_DIR || throwErr('OUTPUT_DIR is unset')

const baseUrl = 'https://api.github.com'
const octokit = new Octokit({ auth: githubToken })
const perPage = 100
const pages = Math.max(1, Math.trunc(repos / perPage));

(async function downloader () {
  for (const p of range(1, pages, 1)) {
    console.log(`Searching page: ${p}`)
    try {
      const { data: { items: repos } } = await octokit.search.repos({
        q: `stars:${starsQuery} language:${progLang} sort:stars`,
        per_page: perPage,
        page: p
      })

      await makeDir(outputDir)
      for (const repo of repos) {
        let { name, owner: { login }, default_branch: ref } = repo
        const spinner = ora(`Downloading ${login}/${name}$${ref}`).start()
        const options = {
          headers: {
            'User-Agent': 'gh-downloader'
          },
          uri: `${baseUrl}/repos/${login}/${name}/zipball/${ref}`,
          followAllRedirects: true
        }
        let downloaded = false
        try {
          const response = await rp(options)
            .on('close', () => {
              downloaded = true
            })
            .pipe(fs.createWriteStream(`${outputDir}/${login}-${name}-${ref}.zip`))
          while (!downloaded) {
            await sleep(2000)
          }
          spinner.stop()
          console.log(`Repo ${login}/${name}$${ref} downloaded!`)
        } catch (reqErr) {
          console.error(reqErr)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
})()
