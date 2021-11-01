const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.some((user) => user.username === username);
  if(!userExists) return response.status(400).json({
    error: 'User not exists'
  });
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);
  if(userExists) return response.status(400).json({
    error: 'User exists'
  });

  users.push({
      id: uuidv4(),
      name,
      username,
      todos: []
    });
  return response.json(users[users.length-1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const userIndex = users.findIndex(user => user.username === username);
  return response.json(users[userIndex].todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const user = users.find(user => user.username === username);
  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).json(user.todos[user.todos.length-1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  if(todoIndex<0){
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  const todo = users[userIndex].todos[todoIndex];

  const deadlineDate = new Date(deadline);

  users[userIndex].todos[todoIndex] = {
    id: todo.id,
    title,
    done: todo.done,
    deadline: deadlineDate,
    created_at: todo.created_at
  }
  

  return response.json({ 
    deadline: deadlineDate,
    done: todo.done,
    title
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  if(todoIndex<0){
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  users[userIndex].todos[todoIndex].done = true;
  return response.json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  if(todoIndex<0){
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
  users[userIndex].todos.splice(todoIndex, 1);
  return response.status(204).send();
});

module.exports = app;