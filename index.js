const fs = require("fs");
const yaml = require('js-yaml');
const axios = require('axios');
const RedditPoster = require("./RedditPoster.js");

const langs_to_subreddit = {
    "fr": "WriteStreak",
    "zh": "WriteStreakCN",
    "da": "WriteStreakDanish",
    "es": "WriteStreakES",
    "de": "WriteStreakGerman",
    "it": "WriteStreakIT",
    "jp": "WriteStreakJP",
    "nl": "WriteStreakNL",
};

const correct_me_flairids = {
    "WriteStreak": "531d3232-b890-11ea-9d84-0ece2f8f4743",
    "WriteStreakCN": "fc52f61c-e061-11eb-a73c-0e91a34c142f",
    "WriteStreakDanish": "1bdc39b2-d446-11eb-b412-0e6decfda173",
    "WriteStreakES": "8af18e3c-1273-11eb-adc2-0ec7ec6eb17f",
    "WriteStreakGerman": "f208bf10-ffbc-11ea-98ea-0ee0605402d7",
    "WriteStreakIT": null,
    "WriteStreakJP": "fe419b46-840d-11eb-bdfd-0e9867bf1aff",
    "WriteStreakNL": "3d9e7da2-3761-11ec-b274-de63c61c2ac7"
}



const FM_BOUNDARY = "---"

const postsPath = process.cwd() + "/_posts/";
const posts = fs.readdirSync(postsPath);


let redditPoster;


posts.forEach(postFileName => {
    const buffer = fs.readFileSync(postsPath + postFileName);
    const text = buffer.toString();
    let [_, fmRaw, content] = text.split(FM_BOUNDARY, 3);
    fmRaw = fmRaw.trim()
    content = content.trim();
    const fm = yaml.load(fmRaw);    
    const redditLink = fm["reddit-url"];

    if (!redditLink) {
        if (fm["published"] === true) {
            console.log("should publish: " + postFileName);
            const lang = fm['lang'];
            const subreddit = langs_to_subreddit[lang];
            const flairId = correct_me_flairids[subreddit];
            const title = "Streak " + fm['streak-number'] + ": " + fm['title'];

            console.log(subreddit)
            console.log(title)
            console.log(flairId)
            console.log(content)

            if (!redditPoster) {
                redditPoster = new RedditPoster();
            }
            redditPoster.post(subreddit, title, content, flairId)
            .then(newRedditLink => {
                const newText = text.replace(/^reddit-url:.*$/m, "reddit-url: " + newRedditLink);
                try {
                    fs.writeFileSync(postsPath + postFileName, newText)
                    //file written successfully
                } catch (err) {
                    console.error(err)
                }
            })
        }
    } else {
        // check if the content has changed
        const jsonpath = encodeURI(redditLink + ".json");
        axios.get(jsonpath, {
            'User-Agent': 'GitHub Pages to Reddit Publisher (by /u/ebubsy)'
        })
            .then(resp => {
                const data = resp.data;
                const redditContent = data[0]['data']['children'][0]['data']['selftext'].trim();
                // console.log(redditContent)
                if (content === redditContent) {
                    // no-op
                } else {
                    // need to edit the post
                    console.log("should edit: " + redditLink)        
                    if (!redditPoster) {
                        redditPoster = new RedditPoster();
                    }
                    redditPoster.edit(redditLink, content);                    
                }
            })
    }

})