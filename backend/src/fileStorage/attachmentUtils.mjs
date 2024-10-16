import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function generateImageUrl(id) {
  const command = new PutObjectCommand({
    Bucket: process.env.TODOS_S3_BUCKET,
    Key: id
  })
  const newUrl = await getSignedUrl(new S3Client(), command, {
    expiresIn: process.env.SIGNED_URL_EXPIRATION
  })
  return newUrl
}
