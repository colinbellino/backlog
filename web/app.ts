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

  async function getTasks() {
    return tasks;
  }

  // function getTasks() {
  //   return new Promise<Task[]>((resolve) => setTimeout(resolve, 1000, tasks));
  // }

  async function getGames() {
    return games;
  }

  return { getTasks, getGames };
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
  window.onpopstate = history.onpushstate = history.onreplacestate = onPushState;

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
      document.title = "New task";
      root.innerHTML = "/tasks/new";
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

function redirect(url: string) {
  history.pushState({}, "", url);
  // bootstrapApp();
}

function renderLoading() {
  root.innerHTML = "Loading...";
}

function renderError(error: Error) {
  root.innerHTML = error.toString();
}

function onLinkClick(this: HTMLAnchorElement, event: MouseEvent) {
  redirect(this.getAttribute("href")!);
  event.preventDefault();
}

function renderTasksList(tasks: Task[], games: Game[]) {
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

  document.title = "Tasks";

  let link = document.querySelector("a")!;
  link.addEventListener("click", onLinkClick);
}

bootstrapApp();
