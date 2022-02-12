const core = require("@actions/core");
const github = require("@actions/github");
const yaml = require("js-yaml");
const fs = require("fs");

const octokit = new github.getOctokit(process.env.GITHUB_TOKEN);
const owner = process.env.GITHUB_REPOSITORY.split("/")[0];
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];

async function getTags() {
    return octokit.rest.repos.getLatestRelease({ owner, repo })
        .then(res => {
            return res.data.tag_name;
        })
        .catch(err => {
            return null;
        })
}

function loadTagsFile() {
    const fileName = core.getInput("config-file");
    const filePath = `${process.env.GITHUB_WORKSPACE}/${fileName}`;
    const tags = yaml.load(fs.readFileSync(filePath, "utf8"));
    // Raise an error if the file is empty or no title is provided
    if (!tags || !tags.name) {
        throw new Error(`${fileName} is empty or missing a title or version`);
    }
    const name = tags.name;

    if (tags.description) {
        const body = tags.description;
        return { name, body };
    } else if (tags.description_file) {
        const body = fs.readFileSync(`${process.env.GITHUB_WORKSPACE}/${tags.description_file}`, "utf8");
        return { name, body };
    } else {
        return { name, body: "" };
    }
}


async function add_tag_to_github(latest_tag, new_tag) {
    if (latest_tag != null) {
        if (latest_tag == new_tag) {
            // Exit early if the tag is already on the repo
            core.notice(`Tag ${new_tag} already exists on the repo`);
            return;
        }
    }
    core.info(`Trying to add ${new_tag.name}`);
    return await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: new_tag.name,
        body: new_tag.body,
        target_commitish: core.getInput("branch"),
        generate_release_notes: true,
        draft: true
    })
}


async function run() {
    try {
        const new_tag = loadTagsFile();
        core.info(`New tag: ${new_tag.name}`);
        const latest_tag = await getTags();
        core.info(`Latest tag: ${latest_tag}`);
        await add_tag_to_github(latest_tag, new_tag);
    } catch (error) {
        core.setFailed(`Failed to add tag; reason: ${error}`);
    }
}

run()
    .then(res => {
        core.info(`Tag added successfully`);
    })
    .catch(err => {
        core.setFailed(err.message);
    });