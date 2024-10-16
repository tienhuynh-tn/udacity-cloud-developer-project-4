import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

export class TodosAccess {
  constructor() {
    this.database = DynamoDBDocument.from(
      AWSXRay.captureAWSv3Client(new DynamoDB())
    )
    this.todos = process.env.TODOS_TABLE
    this.todoCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
  }

  async createItem(item) {
    await this.database.put({
      TableName: this.todos,
      Item: item
    })

    return item
  }

  async updateItem(item) {
    const newTodo = await this.database.update({
      TableName: this.todos,
      Key: {
        todoId: item.todoId,
        userId: item.userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': item.name,
        ':dueDate': item.dueDate,
        ':done': item.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    })
    return newTodo
  }

  async deleteItem(todoId, userId) {
    const isDeleted = await this.database.delete({
      TableName: this.todos,
      Key: { todoId, userId }
    })
    return isDeleted
  }

  async getListOfTodo(userId) {
    const todos = await this.database.query({
      TableName: this.todos,
      IndexName: this.todoCreatedAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return todos.Items
  }

  async saveImgUrl(userId, todoId, bucketName) {
      await this.database.update({
          TableName: this.todos,
          Key: { userId, todoId },
          ConditionExpression: 'attribute_exists(todoId)',
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
          }
        });
    }
}
