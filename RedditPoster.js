// MIT License

// Copyright (c) 2020 Bjorn Lu (https://github.com/bluwy/release-for-reddit-action)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const https = require('https');

let core;
try {
    core = require('@actions/core');
} catch {
    core = {
        info: (infoMsg) => { console.log(infoMsg) },
        setOutput: (output) => { },
        setFailed: (output) => { console.log(output) }
    }
}

const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;
const APP_ID = process.env.REDDIT_APP_ID;
const APP_SECRET = process.env.REDDIT_APP_SECRET;

class RedditPoster {
    constructor() {
        // Auth
        this.username = USERNAME;
        this.password = PASSWORD;
        this.appId = APP_ID;
        this.appSecret = APP_SECRET;

        // Others
        this.notification = true;
        this.retryRateLimit = 1;
        this.userAgent = `GitHub Pages to Reddit Publisher (by /u/${this.username})`

        // Will be init by function below since it's async
        this.accessToken = ''
    }

    // The main logic here
    async post(subreddit, title, content, flairId) {

        return new Promise((resolve, reject) => {
            this.initAccessToken()
                .then(() => this.submitPost(subreddit, title, content, flairId))
                .then(postData => {
                    core.info(`View post at ${postData.url}`)
                    resolve(postData.url);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    async edit(redditLink, content) {

        const thingId = "t3_" + redditLink.split("/")[6];

        return new Promise((resolve, reject) => {
            this.initAccessToken()
                .then(() => this.editPost(thingId, content))
                .then(postData => {
                    core.info(`View post at ${postData.url}`)
                    resolve(postData.url);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    async initAccessToken() {
        const result = await this._post(
            {
                host: 'www.reddit.com',
                path: '/api/v1/access_token',
                auth: `${this.appId}:${this.appSecret}`
            },
            {
                grant_type: 'password',
                username: this.username,
                password: this.password
            }
        )

        this.accessToken = result['access_token']
    }

    async editPost(thingId, content) {
        let postData = {
            api_type: 'json',
            thing_id: thingId,
            text: content
        }

        const result = await this._retryIfRateLimit(async () => {
            const r = await this._post(
                {
                    host: 'oauth.reddit.com',
                    path: `/api/editusertext`,
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                },
                postData
            )

            // Check error here so we can retry if hit rate limit.
            // Reddit returns code 200 for rate limit for some reason.
            if (r.json.errors.length) {
                throw new Error(r.json.errors)
            }

            return r
        })

        return result.json.data
    }

    async submitPost(subreddit, title, content, flairId) {
        let postData = {
            api_type: 'json',
            sr: subreddit,
            title: title,
            sendreplies: this.notification,
            kind: "self",
            text: content
        }

        if (flairId) {
            postData.flair_id = flairId;
        }

        const result = await this._retryIfRateLimit(async () => {
            const r = await this._post(
                {
                    host: 'oauth.reddit.com',
                    path: `/api/submit`,
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                },
                postData
            )

            // Check error here so we can retry if hit rate limit.
            // Reddit returns code 200 for rate limit for some reason.
            if (r.json.errors.length) {
                throw new Error(r.json.errors)
            }

            return r
        })

        return result.json.data
    }

    _post(options, data) {
        const postData = this._encodeForm(data)

        const reqOptions = {
            ...options,
            method: 'POST',
            headers: {
                ...options.headers,
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }

        return new Promise((resolve, reject) => {
            const req = https.request(reqOptions, res => {
                res.setEncoding('utf8')

                let data = ''

                res.on('data', chunk => {
                    data += chunk
                })
                res.on('error', e => reject(e))
                res.on('end', () => resolve(JSON.parse(data)))
            })

            req.on('error', e => reject(e))
            req.write(postData)
            req.end()
        })
    }

    /**
     * Retry function again if hit rate limit
     * @param {Function} fn
     * @param {number} retryCount The number of retries. If 0, will not retry again.
     * @returns The return type of fn
     */
    async _retryIfRateLimit(fn, retryCount = this.retryRateLimit) {
        try {
            return await fn()
        } catch (e) {
            const rateLimit = this._getRateLimitSeconds(e.message)

            if (rateLimit > 0 && retryCount > 0) {
                core.info(`Rate limit hit. Waiting ${rateLimit} seconds to retry...`)

                await this._wait(rateLimit * 1000)

                return await this._retryIfRateLimit(fn, retryCount - 1)
            }

            throw e
        }
    }

    _getRateLimitSeconds(errorMessage) {
        // This is a very naive way of overcoming the RATELIMIT but I have no choice
        const matchMessage = errorMessage.match(
            /RATELIMIT.*try again in (\d*) (s|m)/
        )

        if (!matchMessage || matchMessage.length < 3) {
            return -1
        }

        let rateLimitSeconds = matchMessage[1]

        if (matchMessage[2] === 'm') {
            // Convert minute to seconds
            rateLimitSeconds *= 60
        }

        // Add 1 minute as buffer, just in case
        rateLimitSeconds += 60

        return rateLimitSeconds
    }

    async _wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms)
        })
    }

    _encodeForm(data) {
        return Object.entries(data)
            .map(v => v.map(encodeURIComponent).join('='))
            .join('&')
    }
}

module.exports = RedditPoster;