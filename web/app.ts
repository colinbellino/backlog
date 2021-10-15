enum Statuses {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

type Task = {
  id: number;
  gameId: number;
  status: Statuses;
};

type Game = {
  id: number;
  name: string;
  boxArt: string;
};

type AppStorage = {
  getTasks: () => Promise<Task[]>;
  getTask: (taskId: number) => Promise<Task | null>;
  createTask: (data: Pick<Task, "gameId">) => Promise<Task>;
  updateTask: (taskId: number, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  getGames: () => Promise<Game[]>;
};

const statuses = [
  { id: 0, name: "TODO" },
  { id: 1, name: "IN_PROGRESS" },
  { id: 2, name: "DONE" },
];

function createStorage(): AppStorage {
  const tasks: Task[] = [
    {
      id: 1,
      gameId: 0,
      status: Statuses.TODO,
    },
    {
      id: 2,
      gameId: 1,
      status: Statuses.IN_PROGRESS,
    },
    {
      id: 3,
      gameId: 2,
      status: Statuses.DONE,
    },
  ];

  const games: Game[] = [
    { id: 0, name: "ZELDA", boxArt: "278615-legendofzelda1.jpg" },
    { id: 1, name: "MARIO", boxArt: "2362267-nes_supermariobros.jpg" },
    { id: 2, name: "DARK_SOULS", boxArt: "2555200-dsclean.jpg" },
  ];

  const getTasks: AppStorage["getTasks"] = async function () {
    return tasks;
  };

  const getTask: AppStorage["getTask"] = async function (taskId) {
    return tasks.find(task => task.id === taskId) || null;
  };

  const getGames: AppStorage["getGames"] = async function () {
    return games;
  };

  const createTask: AppStorage["createTask"] = async function (data) {
    // Spec: create a sorted list of tasks, without modifying the existing
    let id = 1;
    if (tasks.length > 0) {
      const sortedTasks = [...tasks].sort((a, b) => b.id - a.id);
      id = sortedTasks[0]!.id + 1;
    }

    const task = { ...data, status: Statuses.TODO, id };
    tasks.push(task);
    return task;
  };

  const updateTask: AppStorage["updateTask"] = async function (taskId, data) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex == -1) {
      throw Error("Task not found: " + taskId);
    }

    const oldTask = tasks[taskIndex]!;
    tasks[taskIndex] = { ...oldTask, ...data };

    return tasks[taskIndex]!;
  };

  const deleteTask: AppStorage["deleteTask"] = async function (taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex == -1) {
      throw Error("Task not found: " + taskId);
    }

    tasks.splice(taskIndex, 1);
  };

  return { getTasks, getTask, createTask, updateTask, deleteTask, getGames };
}

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
      return `
        <li>
          <h3>Task ${task.id}</h3>
          <div>
            <a href="/tasks/${task.id}">details</a>
            <br />
            <img src="/public/${game.boxArt}" width="100" /><br />
            gameId: ${game.name} (${game.id})
            <br />
            status: ${Statuses[task.status]}
          </div>
        </li>
      `;
    })
    .join("\n");
  root.innerHTML = `
    <a href="/tasks/new">New task</a>
    <ul>${list}</ul>
  `;
}

function renderNewTaskPage(games: Game[]): void {
  document.title = "New task";

  const options = games
    .map(game => `<option value="${game.id}">${game.name}</option>`)
    .join("\n");
  root.innerHTML = `
    <a href="/tasks">Back to list</a>
    <hr />
    <div>
      <h1>Create a new task</h1>
      <form id="new_task_form">
        <label for="gameId">Select a game</label>
        <select name="gameId">${options}</select>
        <input type="submit" value="Create" />
      <form>
    </div>
  `;

  const form = document.querySelector("#new_task_form")!;
  form.addEventListener("submit", onNewTaskFormSubmit);
}

function renderTaskDetailsPage(task: Task, games: Game[]) {
  document.title = `Task details (${task.id})`;

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
    <a href="/tasks">Back to list</a>
    <hr />
    <h3>Task ${task.id}</h3>
    <div>
      <img src="/public/${game.boxArt}" width="100" />
      <br />
      gameId: ${game.name} (${game.id})
      <br/>
      status: ${Statuses[task.status]}
    </div>
    <hr />
    <form id="edit_task_form">
      <label for="gameId">Select a game</label>
      <select name="gameId">${gameOptions}</select>
      <label for="status">Select a status</label>
      <select name="status">${statusOptions}</select>
      <input type="submit" value="Update" />
    </form>
    <form id="delete_task_form">
      <button type="submit">Delete</button>
    </form>
  `;

  const editForm = document.querySelector("#edit_task_form")!;
  editForm.addEventListener("submit", onEditTaskFormSubmit(task));

  const deleteForm = document.querySelector("#delete_task_form")!;
  deleteForm.addEventListener("submit", onDeleteTaskFormSubmit(task));
}

const storage = createStorage();
const root = document.querySelector("#app_root")!;
bootstrapApp();
