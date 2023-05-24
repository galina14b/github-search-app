"use strict";

// DOM variables
const container = document.querySelector(".searchContainer");
const searchUserInput = document.querySelector(".searchUser");
const profile = document.querySelector(".profile");

class API {
  clientId = "6d8809c0211bc2b3663a";
  clientSecret = "67cd0b0fe2148e8fefe7dc12317f37d94e8e8b6a";

  async getUser(userName) {
    const response = await fetch(`https://api.github.com/users/${userName}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  };

  async getRepositories(userText) {
    const response = await fetch(`https://api.github.com/users/${userText}/repos?per_page=5`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`,
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  }
}

class UI {
  showProfile({
    avatar_url,
    html_url,
    public_repos,
    public_gists,
    followers,
    following,
    company,
    blog,
    location = "",
    created_at
  }) {
    profile.innerHTML = `
    <div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3">
            <img class="img-fluid mb-2" src="${avatar_url}">
            <a href="${html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge badge-primary">Public Repos: ${public_repos}</span>
            <span class="badge badge-secondary">Public Gists: ${public_gists}</span>
            <span class="badge badge-success">Followers: ${followers}</span>
            <span class="badge badge-info">Following: ${following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${company}</li>
              <li class="list-group-item">Website/Blog: ${blog}</li>
              <li class="list-group-item">Location: ${location}</li>
              <li class="list-group-item">Member Since: ${created_at}</li>
            </ul>
          </div>
        </div>
      </div>
      <h3 class="page-heading mb-3">Latest Repos</h3>
      <div class="repos"></div>
    `;
  }

  clearProfile() {
    profile.innerHTML = "";
  }

  showRepositories(data) {
    // full_name = "", git_url
    const repos = document.querySelector('.repos');
    let text = '';
    data.forEach(element => {
      text = text + `
      <div class="row">
        <div class="col">
          <div class="list-group-item">${element.name}</div>
        </div>
        <div class="col">
          <div class="list-group-item">${element.git_url}</div>
        </div>
      </div>`
    });
    repos.innerHTML = `
      <div class="row">
        <div class="col">
          <h5 class="page-heading mb-3">Repository Name</h5>
        </div>
        <div class="col">
          <h5 class="page-heading mb-3">Repository Link</h5>
        </div>
      </div>
      ${text}
    `;
  }

  showAlert(message, type, timeout = 3000) {
    this.clearAlert();

    const div = document.createElement("div");
    div.className = `alert ${type}`;
    div.appendChild(document.createTextNode(message));

    const search = document.querySelector(".search");
    container.insertBefore(div, search);

    setTimeout(() => {
      this.clearAlert();
    }, timeout);
  }

  clearAlert() {
    const alertBlock = document.querySelector(".alert");
    if (alertBlock) {
      alertBlock.remove();
    }
  }
}

const handleInput = async (event) => {
  const ui = new UI();
  const userText = event.target.value.trim();

  if (!userText) {
    ui.clearProfile();
    return;
  }

  try {
    const api = new API();
    const user = await api.getUser(userText);
    ui.clearAlert();
    const repos = await api.getRepositories(userText);

    
    ui.showProfile(user);
    ui.showRepositories(repos);
  } catch (error) {
    ui.showAlert(error.message, "alert-danger");
    ui.clearProfile();
  }
};

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Event listeners
searchUserInput.addEventListener("input", debounce(handleInput, 1000));
