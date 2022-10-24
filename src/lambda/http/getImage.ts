import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()

const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const imageId = event.pathParameters.imageId

  const result = await docClient.query({
      TableName : imagesTable,
      IndexName : imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
          ':imageId': imageId
      }
  }).promise()

  if (result.Count !== 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items[0])
    }
  }

  return {
    statusCode: 404,
    body: ''
  }
})

handler.use(
  cors({
    credentials: true
  })
)