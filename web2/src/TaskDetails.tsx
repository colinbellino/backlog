import { Game, Task, statuses } from "./storage";

type TaskDetailsProps = {
  task: Task;
  games: Game[];
  onUpdateClick: (task: Task) => void
  onDeleteClick: (task: Task) => void
  onChange: (task: Task) => void
}

export function TaskDetails({ task, games, onUpdateClick: onEdit, onDeleteClick: onDelete, onChange }: TaskDetailsProps) {
  function onEditFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    onEdit(task);
  }

  function onDeleteFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    onDelete(task);
  }

  function onGameIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const updatedTask = { ...task };
    updatedTask.gameId = parseInt(event.target.value);

    onChange(updatedTask);
  }

  function onStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const updatedTask = { ...task };
    updatedTask.status = parseInt(event.target.value);

    onChange(updatedTask);
  }

  function onSubTaskCreate(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();

    const updatedTask = { ...task };
    if (updatedTask.subTasks === undefined) {
      updatedTask.subTasks = [];
    }

    const lastSubTask = updatedTask.subTasks[updatedTask.subTasks.length - 1];
    let lastId = 0;
    if (lastSubTask !== undefined) {
      lastId = lastSubTask.id + 1;
    }

    updatedTask.subTasks.push({ id: lastId, content: "", done: false, priority: 0 });

    onChange(updatedTask);
  }

  const game = games.find((game) => game.id === task.gameId) as Game;

  return (
    <div>
      <div className="taskItem" style={{ backgroundImage: `url('/${game.boxArt}')` }}>
        <h1 className="taskName">Task #{task.id}</h1>
      </div>
      <div className="content">
        <h2>Edition</h2>
        <form id="edit_task_form" onSubmit={onEditFormSubmit}>
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
          <input type="button" value="Add subTask" onClick={onSubTaskCreate} />
          <ul>
            {task.subTasks === undefined ? null : (
              [...task.subTasks].sort((a, b) => b.priority - a.priority).map(subTask => (
                <li key={subTask.id}>
                  <input type="checkbox" defaultChecked={subTask.done} />
                  <input type="text" defaultValue={subTask.content} /> (id: {subTask.id})
                </li>
              ))
            )}
          </ul>
          <input type="submit" value="Update" className="button" />
        </form>
        <form id="delete_task_form" onSubmit={onDeleteFormSubmit}>
          <button type="submit" className="button danger">Delete</button>
        </form>
      </div>
    </div>
  );
}
