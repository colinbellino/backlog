import { createStorage, Task, Game, statuses } from "./storage.js";

function onPushState(data: any, title: string, url: string) {
  // console.log(JSON.stringify({ pathname: document.location.pathname, url }, null, 2));
  renderPage(url || document.location.pathname);
}

async function bootstrapApp() {
  const originalPushState = history.pushState;
  history.pushState = function (data, title, url) {
    // @ts-ignore
    if (typeof history.onpushstate == "function") {
      // @ts-ignore
      history.onpushstate(data, title, url);
    }
    // @ts-ignore
    return originalPushState.apply(history, arguments);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (data, title, url) {
    // @ts-ignore
    if (typeof history.onreplacestate == "function") {
      // @ts-ignore
      history.onreplacestate(data, title, url);
    }
    // @ts-ignore
    return originalReplaceState.apply(history, arguments);
  };

  // @ts-ignore
  window.onpopstate = onPushState;
  // @ts-ignore
  history.onpushstate = onPushState;
  // @ts-ignore
  history.onreplacestate = onPushState;

  renderPage(window.location.pathname);
}

function renderPage(url: string) {
  renderPageForUrl(url)
    .then(() => {
      const links = document.querySelectorAll("a")!;
      links.forEach(link => {
        link.addEventListener("click", onLinkClick);
      });
    })
    .catch(renderError);
}

async function renderPageForUrl(url: string): Promise<void> {
  if (/^\/tasks\/([0-9]+)$/.test(url)) {
    const result = /^\/tasks\/([0-9]+)$/.exec(url);
    const id = parseInt(result![1]!);

    renderLoading();
    return Promise.all([storage.getTask(id), storage.getGames()])
      .then(([task, games]) => {
        if (task == null) {
          return Promise.reject(new Error("Task not found"));
        }
        renderTaskDetailsPage(task, games);
        return;
      });
  }

  switch (url) {
    case "/tasks": {
      renderLoading();
      return Promise.all([storage.getTasks(), storage.getGames()])
        .then(([tasks, games]) => renderTasksListPage(tasks, games))
    }
    case "/tasks/new": {
      renderLoading();
      return storage.getGames()
        .then((games) => renderNewTaskPage(games))
    }
    default: {
      history.pushState({}, "", "/tasks");
    }
  }
}

function renderLoading() {
  root.innerHTML = "Loading...";
}

function renderError(error: Error) {
  root.innerHTML = error.toString();
}

function onLinkClick(this: HTMLAnchorElement, event: MouseEvent) {
  history.pushState({}, "", this.getAttribute("href")!);
  event.preventDefault();
}

function onNewTaskFormSubmit(this: HTMLFormElement, event: Event) {
  event.preventDefault();
  event.stopPropagation();

  const formData = new FormData(this);
  const data = {
    gameId: parseInt(formData.get("gameId") as string),
  };

  // TODO: Handle createTask errors (display errors to the user or something)
  storage.createTask(data)
    .then(_task => { history.pushState({}, "", "/tasks") });
}

function onEditTaskFormSubmit(task: Task) {
  return function listener(this: HTMLFormElement, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const formData = new FormData(this);
    const data: Partial<Task> = {};

    const gameId = parseInt(formData.get("gameId") as string);
    if (gameId !== task.gameId) {
      data.gameId = gameId;
    }

    const status = parseInt(formData.get("status") as string);
    if (status !== task.status) {
      data.status = status;
    }

    storage.updateTask(task.id, data)
      .then(_task => { history.pushState({}, "", "/tasks") });
  }
}

function onDeleteTaskFormSubmit(task: Task) {
  return function listener(this: HTMLFormElement, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    storage.deleteTask(task.id)
      .then(() => { history.pushState({}, "", "/tasks") });
  }
}

function renderTasksListPage(tasks: Task[], games: Game[]): void {
  document.title = "Tasks";

  const list = tasks
    .map((task) => {
      // TODO: handle missing game
      const game = games.find((game) => game.id === task.gameId)!;
      const status = statuses.find((status) => status.id === task.status)!;
      return `
        <li class="taskItem" style="background-image: url('/public/${game.boxArt}');">
          <a href="/tasks/${task.id}">
            <h3 class="taskName">Task #${task.id}</h3>
            <h4 class="taskStatus">${status.name}</h4>
          </a>
        </li>
      `;
    })
    .join("\n");
  root.innerHTML = `
    <a href="/tasks/new" class="button">New task</a>
    <ul class="taskList">${list}</ul>
  `;
}

function renderNewTaskPage(games: Game[]): void {
  document.title = "New task";

  const options = games
    .map(game => `<option value="${game.id}">${game.name}</option>`)
    .join("\n");
  root.innerHTML = `
    <a href="/tasks" class="button">Back to list</a>
    <div class="content">
      <h1>New task</h1>
      <form id="new_task_form">
        <label for="gameId">Select a game</label>
        <select name="gameId">${options}</select>
        <input type="submit" value="Create" class="button" />
      <form>
    </div>
  `;

  const form = document.querySelector("#new_task_form")!;
  form.addEventListener("submit", onNewTaskFormSubmit);
}

function renderTaskDetailsPage(task: Task, games: Game[]) {
  document.title = `Task (${task.id})`;

  const game = games.find((game) => game.id === task.gameId)!;
  const gameOptions = games
    .map(game => `<option value="${game.id}" ${game.id === task.gameId ? "selected" : ""}>${game.name}</option>`)
    .join("\n");
  const statusOptions = statuses
    .map((status) => {
      return `<option value="${status.id}" ${status.id === task.status ? "selected" : ""}>${status.name}</option>`
    })
    .join("\n");

  root.innerHTML = `
    <a href="/tasks" class="button">Back to list</a>
    <div class="taskItem" style="background-image: url('/public/${game.boxArt}');">
      <h1 class="taskName">Task #${task.id}</h1>
    </div>
    <div class="content">
      <h2>Edition</h2>
      <form id="edit_task_form">
        <div>
          <label for="gameId">Select a game</label>
          <select name="gameId">${gameOptions}</select>
        </div>
        <div>
          <label for="status">Select a status</label>
          <select name="status">${statusOptions}</select>
        </div>
        <input type="submit" value="Update" class="button" />
      </form>
      <form id="delete_task_form">
        <button type="submit" class="button danger">Delete</button>
      </form>
    </div>
  `;

  const editForm = document.querySelector("#edit_task_form")!;
  editForm.addEventListener("submit", onEditTaskFormSubmit(task));

  const deleteForm = document.querySelector("#delete_task_form")!;
  deleteForm.addEventListener("submit", onDeleteTaskFormSubmit(task));
}

const storage = createStorage();
const root = document.querySelector("#app_root")!;
bootstrapApp();
