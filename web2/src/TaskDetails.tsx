import { Game, Task, statuses, SubTask } from "./storage";
import { SubTaskList } from "./SubTaskList";

type TaskDetailsProps = {
  task: Task;
  games: Game[];
  onDeleteClick: (task: Task) => void
  onTaskChange: (task: Task) => void
}

export function TaskDetails({ task, games, onDeleteClick, onTaskChange }: TaskDetailsProps) {
  function onDeleteFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    onDeleteClick(task);
  }

  function onGameIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const updatedTask = { ...task };
    updatedTask.gameId = parseInt(event.target.value);

    onTaskChange(updatedTask);
  }

  function onStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const updatedTask = { ...task };
    updatedTask.status = parseInt(event.target.value);

    onTaskChange(updatedTask);
  }

  function onSubTasksChange(subTasks: SubTask[]) {
    onTaskChange({ ...task, subTasks });
  }

  const game = games.find((game) => game.id === task.gameId) as Game;

  return (
    <div>
      <div className="taskItem" style={{ backgroundImage: `url('/${game.boxArt}')` }}>
        <h1 className="taskName">Task #{task.id}</h1>
      </div>
      <div className="content">
        <h2>Edition</h2>
        <div>
          <label htmlFor="gameId">Select a game</label>
          <select name="gameId" value={task.gameId} onChange={onGameIdChange}>
            {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status">Select a status</label>
          <select name="status" value={task.status} onChange={onStatusChange}>
            {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
          </select>
        </div>
        <form id="delete_task_form" onSubmit={onDeleteFormSubmit}>
          <button type="submit" className="button danger">Delete</button>
        </form>
        <SubTaskList defaultSubTasks={task.subTasks} onChange={onSubTasksChange} />
      </div>
    </div>
  );
}
