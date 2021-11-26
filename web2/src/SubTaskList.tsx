import { useState } from "react";
import { SubTask } from "./storage";

export type SubTaskListProps = {
  defaultSubTasks: SubTask[] | undefined;
  onChange: (task: SubTask[]) => void;
}

export function SubTaskList({ defaultSubTasks, onChange }: SubTaskListProps) {
  function updateSubTask(subTask: SubTask) {
    const index = subTasks.findIndex(item => item.id === subTask.id);
    const updatedSubTasks = [...subTasks];
    updatedSubTasks[index] = subTask;

    setSubTasks(updatedSubTasks);
    // TODO: call onChange
  }

  function onDoneChange(subTask: SubTask) {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
      const updatedSubTask = { ...subTask };
      updatedSubTask.done = event.target.checked;

      updateSubTask(updatedSubTask);
    }
  }

  function onContentChange(subTask: SubTask) {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
      const updatedSubTask = { ...subTask };
      updatedSubTask.content = event.target.value;

      updateSubTask(updatedSubTask);
    }
  }

  function onDeleteClick(subTask: SubTask) {
    return function (event: React.MouseEvent<HTMLButtonElement>) {
      const index = subTasks.findIndex(item => item.id === subTask.id);
      const updatedSubTasks = [...subTasks];
      updatedSubTasks.splice(index, 1);

      setSubTasks(updatedSubTasks);
      onChange(updatedSubTasks);
    }
  }

  function onAddSubTask(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();

    const lastSubTask = subTasks[subTasks.length - 1];
    let lastId = 0;
    if (lastSubTask !== undefined) {
      lastId = lastSubTask.id + 1;
    }

    const newSubTask = { id: lastId, content: "", done: false, priority: 0 };
    var updatedSubTasks = [...subTasks, newSubTask];
    setSubTasks(updatedSubTasks);

    onChange(updatedSubTasks);
  }

  const [subTasks, setSubTasks] = useState(defaultSubTasks || []);
  const sortedSubTasks = [...subTasks].sort((a, b) => b.priority - a.priority);

  return (
    <div>
      <input type="button" value="Add subTask" onClick={onAddSubTask} />
      <ul>
        {sortedSubTasks.map(subTask => (
          <li key={subTask.id}>
            <input type="checkbox" checked={subTask.done} onChange={onDoneChange(subTask)} />
            <input type="text" defaultValue={subTask.content} onChange={onContentChange(subTask)} /> (id: {subTask.id})
            <button type="submit" className="button danger" onClick={onDeleteClick(subTask)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
