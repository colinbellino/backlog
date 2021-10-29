import { useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { Link } from "react-router-dom";

import { Task, Game, statuses, AppStorage } from "./storage";

type TaskListPageProps = {
  storage: AppStorage;
};

export function TaskListPage({ storage }: TaskListPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tasks";
    Promise.all([storage.getTasks(), storage.getGames()])
      .then(([tasks, games]) => {
        unstable_batchedUpdates(() => {
          setTasks(tasks);
          setGames(games);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onClick() {
    setTasks(tasks);
    setGames(games);
  }

  return (
    <div>
      <Link to="/tasks/new" className="button">New task</Link>
      {loading ? null : (
        <div onClick={onClick}>
          <ul className="taskList">
            {tasks.map(task => {
              const game = games.find((game) => game.id === task.gameId)!;
              const status = statuses.find((status) => status.id === task.status)!;

              return (
                <li key={task.id} className="taskItem" style={{ backgroundImage: `url('/${game.boxArt}')` }}>
                  <Link to={`/tasks/${task.id}`}>
                    <h3 className="taskName">Task #{task.id}</h3>
                    <h4 className="taskStatus">{status.name}</h4>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
