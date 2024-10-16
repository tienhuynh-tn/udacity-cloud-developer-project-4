import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodosAccess()

export const create = async (req, userId) => {
  const todoId = uuid.v4()
  return await todoAccess.createItem({
    todoId,
    name: req.name,
    userId,
    dueDate: req.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${process.env.TODOS_S3_BUCKET}.s3.amazonaws.com/${todoId}`
  })
}

export const update = async (req, todoId, userId) =>
  await todoAccess.updateItem({
    todoId,
    name: req.name,
    dueDate: req.dueDate,
    done: req.done,
    userId
  })

export const deleteItem = async (todoId, userId) =>
  await todoAccess.deleteItem(todoId, userId)

export const getTodos = async (userId) => await todoAccess.getListOfTodo(userId)
