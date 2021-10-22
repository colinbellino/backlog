import { useEffect, useState } from "react";
import { createStorage, Task, Game, statuses } from "./storage";

const storage = createStorage();

function TaskListPage() {
  // TODO:
  // - Set document.title = "Tasks"
  // - Link to "new task"
  // - List of tasks
  //   - Task image
  //   - Task name
  //   - Task status
  //   - Task link

  const [tasks, setTasks] = useState<Task[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([storage.getTasks(), storage.getGames()])
      .then(([tasks, games]) => {
        setTasks(tasks);
        setGames(games);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ?
        <div>Loading...</div> :
        <div>
          <a href="/tasks/new" className="button">New task</a>
          <ul className="taskList">
            {tasks.map(task => {
              const game = games.find((game) => game.id === task.gameId)!;
              const status = statuses.find((status) => status.id === task.status)!;

              return (
                <li key={task.id} className="taskItem" style={{ backgroundImage: `url('/${game.boxArt}')` }}>
                  <a href={`/tasks/${task.id}`}>
                    <h3 className="taskName">Task #{task.id}</h3>
                    <h4 className="taskStatus">{status.name}</h4>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
}

export default TaskListPage;
