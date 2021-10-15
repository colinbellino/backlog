import { useEffect, useState } from "react";
import { createStorage, Task, Game } from "./storage";

const storage = createStorage();

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([storage.getTasks(), storage.getGames()])
      .then(([tasks, games]) => {
        setTasks(tasks);
        setGames(games);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {loading ? "Loading..." : <pre>{JSON.stringify({ tasks, games }, null, 2)}</pre>}
    </div>
  );
}

export default App;
