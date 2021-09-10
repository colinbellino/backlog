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
      id: "hello-1",
      game_id: "ZELDA",
      status: Statuses.TODO,
    },
    {
      id: "pouet-2",
      game_id: "MARIO",
      status: Statuses.IN_PROGRESS,
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

async function bootstrapApp() {
  // Route: /games
  // Fetch games list - OK
  // Render games list -
  // - Click game -> Navigate to /games/:id
  // - Click delete game -> Delete game & render games list
  // - Click add game -> Navigate to /games/new
  renderLoading();
  Promise.all([storage.getTasks(), storage.getGames()])
    .then(([tasks, games]) => renderTasksList(tasks, games))
    .catch(renderError);

  // Route: /games/new
  // Render empty form
  // - Input title
  // - Click submit -> Navigate to /games
  //

  // Route: /games/:id
  // Fetch game data
  // Render game infos
  // - Click back -> Navigate to /games
  //
}

function renderLoading() {
  root.innerHTML = "Loading...";
}

function renderError(error: Error) {
  root.innerHTML = error.toString();
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
  root.innerHTML = `<ul>${list}</ul>`;
}

bootstrapApp();
