# gh-downloader

Download GitHub repositories as zipballs given search criteria

## Quick start

1. git clone https://github.com/kyrcha/gh-downloader.git
2. Change directory into `gh-downloader`, `cd gh-downloader`
2. Create an .env file with the following environment variables:
  - GITHUB_TOKEN=<Your GitHub token>
  - PROGRAMMING_LANGUAGE=<A programming language>, i.e. PROGRAMMING_LANGUAGE=java
  - STARS_QUERY=<A stars related query>, i.e. STARS_QUERY='>=100'
  - REPOS=<Number of repositories to download>, i.e. REPOS=100
  - OUTPUT_DIR=<An output directory to store the zipballs>, i.e. OUTPUT_DIR=./output
3. Run `npm install`
4. Run `node index`
