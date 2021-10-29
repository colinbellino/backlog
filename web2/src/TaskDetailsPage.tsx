import React, { useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";

import { AppStorage, Game, Task, statuses } from "./storage";

type TaskDetailsPageProps = {
  storage: AppStorage;
};

export function TaskDetailsPage({ storage }: TaskDetailsPageProps) {
  const history = useHistory();
  const { taskId } = useParams<{ taskId: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [game, setGame] = useState<Game | null>();

  useEffect(() => {
    Promise.all([
      storage.getTask(parseInt(taskId)),
      storage.getGames(),
    ])
      .then(([task, games]) => {
        unstable_batchedUpdates(() => {
          if (task != null) {
            document.title = `Task #${task.id}`;
            setGame(games.find((game) => game.id === task.gameId));
          }
          setTask(task);
          setGames(games);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const formData = new FormData(event.currentTarget);
    const data: Partial<Task> = {};

    const gameId = parseInt(formData.get("gameId") as string);
    if (gameId !== task!.gameId) {
      data.gameId = gameId;
    }

    const status = parseInt(formData.get("status") as string);
    if (status !== task!.status) {
      data.status = status;
    }

    storage.updateTask(task!.id, data)
      .then(_task => { history.push("/tasks") });
  }

  function onDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    storage.deleteTask(task!.id)
      .then(() => { history.push("/tasks") });
  }

  function onSubTaskCreate(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();

    const updatedTask = { ...task! };
    if (updatedTask.subTasks === undefined) {
      updatedTask!.subTasks = [];
    }
    const lastSubTask = updatedTask.subTasks[updatedTask.subTasks.length - 1]!;

    updatedTask!.subTasks.push({ id: lastSubTask.id + 1, content: "", done: false, priority: 0 });

    setTask(updatedTask);
  }

  if (loading === false && task === null) {
    return <Redirect to="/404" />;
  }

  return (
    <div>
      <Link to="/tasks" className="button">Back to list</Link>
      {loading ? null : (
        <div>
          <div className="taskItem" style={{ backgroundImage: `url('/${game!.boxArt}')` }}>
            <h1 className="taskName">Task #{task!.id}</h1>
          </div>
          <div className="content">
            <h2>Edition</h2>
            <form id="edit_task_form" onSubmit={onEdit}>
              <div>
                <label htmlFor="gameId">Select a game</label>
                <select name="gameId" defaultValue={task!.gameId}>
                  {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status">Select a status</label>
                <select name="status" defaultValue={task!.status}>
                  {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                </select>
              </div>
              <input type="button" value="Add subTask" onClick={onSubTaskCreate} />
              <ul>
                {task!.subTasks === undefined ? null : (
                  [...task!.subTasks].sort((a, b) => b.priority - a.priority).map(subTask => (
                    <li key={subTask.id}>
                      <input type="checkbox" defaultChecked={subTask.done} />
                      <input type="text" defaultValue={subTask.content} /> (id: {subTask.id})
                    </li>
                  ))
                )}
              </ul>
              <input type="submit" value="Update" className="button" />
            </form>
            <form id="delete_task_form" onSubmit={onDelete}>
              <button type="submit" className="button danger">Delete</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
