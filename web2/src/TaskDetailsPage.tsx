import { useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";

import { AppStorage, Game, Task } from "./storage";
import { TaskDetails } from "./TaskDetails";

type TaskDetailsPageProps = {
  storage: AppStorage;
};

export function TaskDetailsPage({ storage }: TaskDetailsPageProps) {
  const history = useHistory();
  const { taskId } = useParams<{ taskId: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    Promise.all([
      storage.getTask(parseInt(taskId)),
      storage.getGames(),
    ])
      .then(([task, games]) => {
        unstable_batchedUpdates(() => {
          if (task != null) {
            document.title = `Task #${task.id}`;
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

  function onDelete(task: Task) {
    storage.deleteTask(task.id)
      .then(() => { history.push("/tasks") });
  }

  function onTaskChange(task: Task) {
    storage.updateTask(task.id, task)
      .then(updatedTask => { setTask(updatedTask); });
  }

  if (loading === false && task === null) {
    return <Redirect to="/404" />;
  }

  return (
    <div>
      <Link to="/tasks" className="button">Back to list</Link>
      {loading ? null : <TaskDetails task={task!} games={games} onDeleteClick={onDelete} onTaskChange={onTaskChange} />}
    </div>
  );
}
