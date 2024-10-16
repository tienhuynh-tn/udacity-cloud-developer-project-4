import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { create } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('createTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Creating todo event: ', event)
    const clientId = getUserId(event)
    const todo = JSON.parse(event.body)
    const newItem = await create(todo, clientId)
    logger.info('Create todo successfully: ', newItem)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  })
