export type Task = {
  id: number;
  gameId: number;
  status: number;
};

export type Game = {
  id: number;
  name: string;
  boxArt: string;
};

export type AppStorage = {
  getTasks: () => Promise<Task[]>;
  getTask: (taskId: number) => Promise<Task | null>;
  createTask: (data: Pick<Task, "gameId">) => Promise<Task>;
  updateTask: (taskId: number, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  getGames: () => Promise<Game[]>;
};

export const statuses = [
  { id: 0, name: "TODO" },
  { id: 1, name: "IN_PROGRESS" },
  { id: 2, name: "DONE" },
];

export function createStorage(): AppStorage {
  const tasks: Task[] = [
    {
      id: 1,
      gameId: 0,
      status: 0,
    },
    {
      id: 2,
      gameId: 1,
      status: 1,
    },
    {
      id: 3,
      gameId: 2,
      status: 2,
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

    const task = { ...data, status: 0, id };
    tasks.push(task);
    return task;
  };

  const updateTask: AppStorage["updateTask"] = async function (taskId, data) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw Error("Task not found: " + taskId);
    }

    const oldTask = tasks[taskIndex]!;
    tasks[taskIndex] = { ...oldTask, ...data };

    return tasks[taskIndex]!;
  };

  const deleteTask: AppStorage["deleteTask"] = async function (taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw Error("Task not found: " + taskId);
    }

    tasks.splice(taskIndex, 1);
  };

  return { getTasks, getTask, createTask, updateTask, deleteTask, getGames };
}
