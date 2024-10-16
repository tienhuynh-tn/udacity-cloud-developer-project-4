import jsonwebtoken from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth0Authorizer')

const jwksUrl =
  'https://tienhuynh-tn.au.auth0.com/.well-known/jwks.json'

const jwks = new JwksClient({
  jwksUri: jwksUrl
})

export async function handler(event) {
  logger.info('Process Auth event: ', event)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized: ', { token: jwtToken })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized: ', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })
  const getKeySigned = await jwks.getSigningKey(jwt.header.kid)
  const signedKey = getKeySigned.publicKey || getKeySigned.rsaPublicKey
  const decoded = jsonwebtoken.verify(token, signedKey, { complete: false })
  return decoded
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
