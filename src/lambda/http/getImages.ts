import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE || 'Groups'
const imagesTable = process.env.IMAGES_TABLE || 'Images'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Caller event', event)
    if (!!event.pathParameters && !!event.pathParameters.groupId) {
        const groupId = event.pathParameters.groupId
        const validGroupId = await groupExists(groupId)

        if (!validGroupId) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Group does not exist'
                })
            }
        }

        const images = await getImagesPerGroup(groupId)

        return {
            statusCode: 201,
            body: JSON.stringify({
            items: images
            })
        }
    }

    return {
        statusCode: 404,
        body: JSON.stringify({
            error: 'Unknown error occurred'
        })
    }
})

async function groupExists(groupId: string) {
    const result = await docClient
        .get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
        })
        .promise()

    console.log('Get group: ', result)
    return !!result.Item
}

async function getImagesPerGroup(groupId: string) {
    const result = await docClient.query({
        TableName: imagesTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
        ':groupId': groupId
        },
        ScanIndexForward: false
    }).promise()

    return result.Items
}

handler.use(
  cors({
    credentials: true
  })
)
