import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const result = await docClient.scan({
    TableName: groupsTable
  }).promise()

  const items = result.Items

  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
