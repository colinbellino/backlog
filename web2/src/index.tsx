import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

// import reportWebVitals from './reportWebVitals';
import { createStorage } from "./storage";
import { TaskListPage } from './TaskListPage';
import { NewTaskPage } from './NewTaskPage';
import './index.css';

const storage = createStorage();

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to="/tasks" />
        </Route>
        <Route exact path="/tasks">
          <TaskListPage storage={storage} />
        </Route>
        <Route exact path="/tasks/new">
          <NewTaskPage storage={storage} />
        </Route>
        <Route path="*">
          <h1>Page not found</h1>
        </Route>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
