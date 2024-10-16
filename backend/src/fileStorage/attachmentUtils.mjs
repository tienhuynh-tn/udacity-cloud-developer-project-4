import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodosAccess()

export async function generateImageUrl(todoId, userId) {
  const bucketName = process.env.TODOS_S3_BUCKET;
  const command = new PutObjectCommand({
    Bucket: process.env.TODOS_S3_BUCKET,
    Key: todoId
  })
  const newUrl = await getSignedUrl(new S3Client(), command, {
    expiresIn: process.env.SIGNED_URL_EXPIRATION
  })
  await todoAccess.saveImgUrl(userId, todoId, bucketName);
  return newUrl
}
