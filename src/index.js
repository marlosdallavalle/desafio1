const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');
const moment = require('moment');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "No exists account." })
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existsUser = users.some((user) => user.username === username)
  if(existsUser){
    return response.status(404).json({ error: "User account already exists." })
  }
  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }
  users.push(user);
  return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: moment(deadline).format('YYYY-MM-DD'),
    created_at: moment(new Date()).format('YYYY-MM-DD')
  }
  user.todos.push(task);
  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  if(user){
    const task = user.todos.find((task) => task.id === id);
    
    if(task){
      task.title = title;
      task.deadline = moment(deadline).format('YYYY-MM-DD')
      return response.status(201).send();
    }
  }

  return response.status(404).json({ error: "No exists tasks for user." })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  if(user){
    const task = user.todos.find((task) => task.id === id);
    
    if(task){
      task.done = true;
      return response.status(201).send();
    }
  }

  return response.status(404).json({ error: "No exists tasks for user." })

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if(user){
    const task = user.todos.find((task) => task.id === id);
    
    if(task){
      user.todos.splice(task,1);
      return response.json();
    }
  }

  return response.status(404).json({ error: "No exists tasks for user." })

});

module.exports = app;