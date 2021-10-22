import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { AppStorage, Game } from "./storage";

type NewTaskPageProps = {
  storage: AppStorage;
};

export function NewTaskPage({ storage }: NewTaskPageProps) {
  const history = useHistory();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "New task";
    storage.getGames()
      .then((games) => {
        setGames(games);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const formData = new FormData(event.currentTarget);
    const data = {
      gameId: parseInt(formData.get("gameId") as string),
    };

    // TODO: Handle createTask errors (display errors to the user or something)
    storage.createTask(data)
      .then(_task => { history.push("/tasks"); });
  }

  return (
    <div>
      <Link to="/tasks" className="button">Back to list</Link>
      {loading ? null : (
        <div className="content">
          <h1>New task</h1>
          <form id="new_task_form" onSubmit={onSubmit}>
            <label htmlFor="gameId">Select a game</label>
            <select name="gameId">
              {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
            </select>
            <input type="submit" value="Create" className="button" />
          </form>
        </div>
      )}
    </div>
  );
}
