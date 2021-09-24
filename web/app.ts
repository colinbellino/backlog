enum Statuses {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

type Task = {
  id: string;
  game_id: string;
  status: Statuses;
};

type Game = {
  id: string;
  box_art: string;
};

type AppStorage = {
  getTasks: () => Promise<Task[]>;
  createTask: (data: { game_id: string }) => Promise<Task>;
  getGames: () => Promise<Game[]>;
};

function createStorage(): AppStorage {
  const tasks: Task[] = [
    {
      id: "zelda_1",
      game_id: "ZELDA",
      status: Statuses.TODO,
    },
    {
      id: "mario_1",
      game_id: "MARIO",
      status: Statuses.IN_PROGRESS,
    },
    {
      id: "ds_1",
      game_id: "DARK_SOULS",
      status: Statuses.DONE,
    },
  ];

  const games: Game[] = [
    { id: "ZELDA", box_art: "278615-legendofzelda1.jpg" },
    { id: "MARIO", box_art: "2362267-nes_supermariobros.jpg" },
    { id: "DARK_SOULS", box_art: "2555200-dsclean.jpg" },
  ];

  const getTasks: AppStorage["getTasks"] = async function () {
    return tasks;
  };

  const getGames: AppStorage["getGames"] = async function () {
    return games;
  };

  const createTask: AppStorage["createTask"] = async function (data) {
    // TODO: Implement this:
    // - Generate a unique ID (do we want to keep a string ?)
    // - Add task to list
    // - Return it
    const task = { ...data, status: Statuses.TODO, id: "" + Math.random() };
    tasks.push(task);
    return task;
  };

  return { getTasks, createTask, getGames };
}

const storage = createStorage();
const root = document.querySelector("#app_root")!;

function onPushState(data: any, title: string, url: string) {
  // console.log(JSON.stringify({ pathname: document.location.pathname, data, title, url }, null, 2));
  renderPage(url);
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

function renderPage(pathname: string) {
  switch (pathname) {
    case "/tasks": {
      // Route: /tasks
      // Fetch games list - OK
      // Render games list -
      // - Click game -> Navigate to /tasks/:id
      // - Click delete game -> Delete game & render games list
      // - Click add game -> Navigate to /tasks/new
      renderLoading();
      Promise.all([storage.getTasks(), storage.getGames()])
        .then(([tasks, games]) => renderTasksList(tasks, games))
        .catch(renderError);
      return;
    }
    case "/tasks/new": {
      // Route: /tasks/new
      // Render empty form
      // - Input title
      // - Click submit -> Navigate to /tasks
      renderLoading();
      storage.getGames()
        .then((games) => renderTaskForm(games))
        .catch(renderError);
      return;
    }
    case "/tasks/:id": {
      // Route: /tasks/:id
      // Fetch game data
      // Render game infos
      // - Click back -> Navigate to /tasks
      document.title = "Task details";
      root.innerHTML = "/tasks/:id";
      return;
    }
    default: {
      history.pushState({}, "", "/tasks");
      return;
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
    game_id: formData.get("game_id") as string,
  };

  storage.createTask(data)
    .then(_task => { history.pushState({}, "", "/tasks") })
    .catch(renderError);
}

function renderTasksList(tasks: Task[], games: Game[]): void {
  document.title = "Tasks";

  const list = tasks
    .map((task) => {
      // TODO: handle missing game
      const game = games.find((game) => game.id === task.game_id)!;
      return `
        <li>
          <h3>${game.id}</h3>
          <div>
            <img src="/public/${game.box_art}" width="100" /><br />
            id: ${task.id}<br/>
            status: ${Statuses[task.status]}
          </div>
        </li>`;
    })
    .join("\n");
  root.innerHTML = `
    <a href="/tasks/new">new</a>
    <ul>${list}</ul>
  `;


  const link = document.querySelector("a")!;
  link.addEventListener("click", onLinkClick);
}

function renderTaskForm(games: Game[]): void {
  document.title = "New task";

  const options = games
    .map(game => `<option value="${game.id}">${game.id}</option>`)
    .join("\n");
  root.innerHTML = `
    <div>
      <h1>Create a new task</h1>
      <form id="new_task_form">
        <label for="game_id">Select a game</label>
        <select name="game_id">${options}</select>
        <input type="submit" value="Submit!" />
      <form>
    </div>
  `;

  const form = document.querySelector("#new_task_form")!;
  form.addEventListener("submit", onNewTaskFormSubmit);
}

bootstrapApp();
