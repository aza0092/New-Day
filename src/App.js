import React from 'react';
import axios from 'axios';
import Layout from './components/responsivelayout';
import User from './components/user';
import './App.css';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';
import {constants} from "./components/constants";

function tasksReducer(state, action){
  switch (action.type) {
    case 'RESET_TASKS':
      return [];
    case 'ADD_TASK':
      return [...state, {...action.payload}];
    case 'UPDATE_TASK':
      return state.map(task => {
        if (task.id !== action.payload.id) return task;
        return action.payload;
      });
    default:
      throw new Error('Wrong action to task reducer');
  }
}

export default function App(){
  const [signedIn, setSignedIn] = React.useState(false);
  const [tasks, dispatchTasks] = React.useReducer(tasksReducer, []);

  function signIn(){
    setSignedIn(true);
  }

  function signOut(){
    dispatchTasks({type: 'RESET_TASKS'});
    localStorage.removeItem('token');
    setSignedIn(false);
  }

  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      axios.get(constants.serverWith('/api/user/checktoken'), {headers: {token: localStorage.getItem('token')}})
        .then((res) => {
          if (res.data.result) {
            signIn();
          } else {
            localStorage.removeItem('token');
          }
        });
    }
  }, []);

  if (!signedIn) {
    return (
      <User signIn={signIn} />
    );
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Layout tasks={tasks} dispatchTasks={dispatchTasks} signOut={signOut}/>
    </MuiPickersUtilsProvider>
  );
}
