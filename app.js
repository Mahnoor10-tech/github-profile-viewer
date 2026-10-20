
const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("search-button");
const message = document.getElementById("message");
const profile = document.getElementById("profile");
const repositoriesSection = document.getElementById("repositories-section");
const repositoriesContainer = document.getElementById("repositories");

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        message.textContent = "Please enter a GitHub username.";
        return;
    }

    searchButton.disabled = true;
    message.textContent = "Loading profile...";
    profile.replaceChildren();
    repositoriesContainer.replaceChildren();
    repositoriesSection.hidden = true;

    try {
        const userResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        if (userResponse.status === 404) {
            throw new Error("GitHub user not found. Check the username.");
        }

        if (!userResponse.ok) {
            throw new Error("GitHub could not return the profile. Try again.");
        }

        const user = await userResponse.json();

        const repoResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`
        );

        if (!repoResponse.ok) {
            throw new Error("Profile found, but repositories could not load.");
        }

        const repos = await repoResponse.json();

        showProfile(user);
        showRepositories(repos);

        message.textContent = "Profile loaded successfully.";
    } catch (error) {
        message.textContent = error.message;
    } finally {
        searchButton.disabled = false;
    }
});

function showProfile(user) {
    const card = document.createElement("div");
    card.className = "profile-card";

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s profile picture`;

    const info = document.createElement("div");
    info.className = "profile-info";

    const name = document.createElement("h2");
    name.textContent = user.name || user.login;

    const username = document.createElement("p");
    username.textContent = `@${user.login}`;

    const bio = document.createElement("p");
    bio.textContent = user.bio || "No biography provided.";

    const location = document.createElement("p");
    location.textContent = user.location || "Location not provided.";

    const githubLink = document.createElement("a");
    githubLink.href = user.html_url;
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.textContent = "View GitHub Profile";

    const stats = document.createElement("div");
    stats.className = "stats";

    const repos = document.createElement("span");
    repos.textContent = `Public repositories: ${user.public_repos}`;

    const followers = document.createElement("span");
    followers.textContent = `Followers: ${user.followers}`;

    const following = document.createElement("span");
    following.textContent = `Following: ${user.following}`;

    stats.append(repos, followers, following);
    info.append(name, username, bio, location, githubLink, stats);
    card.append(avatar, info);
    profile.append(card);
}

function showRepositories(repos) {
    repositoriesSection.hidden = false;

    if (repos.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "This user has no public repositories.";
        repositoriesContainer.append(emptyMessage);
        return;
    }

    repos.forEach(function (repo) {
        const card = document.createElement("article");
        card.className = "repo-card";

        const title = document.createElement("h3");
        const link = document.createElement("a");

        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = repo.name;

        title.append(link);

        const description = document.createElement("p");
        description.textContent = repo.description || "No description available.";

        const language = document.createElement("p");
        language.textContent = `Language: ${repo.language || "Not specified"}`;

        const stars = document.createElement("p");
        stars.textContent = `Stars: ${repo.stargazers_count}`;

        card.append(title, description, language, stars);
        repositoriesContainer.append(card);
    });
}
