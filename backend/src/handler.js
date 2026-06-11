const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = process.env.ITEMS_TABLE || "hackon6-items-dev";

const jsonResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(body),
  };
};

const parseBody = (event) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return null;
  }
};

module.exports.health = async () => {
  return jsonResponse(200, {
    success: true,
    message: "HackOn 6.0 backend is healthy",
    service: "hackon6-api",
    timestamp: new Date().toISOString(),
  });
};

module.exports.createItem = async (event) => {
  try {
    const body = parseBody(event);

    if (!body) {
      return jsonResponse(400, {
        success: false,
        message: "Invalid JSON body",
      });
    }

    const title = body.title?.trim();
    const description = body.description?.trim();

    if (!title) {
      return jsonResponse(400, {
        success: false,
        message: "Title is required",
      });
    }

    const item = {
      id: randomUUID(),
      title,
      description: description || "",
      status: body.status || "new",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: ITEMS_TABLE,
        Item: item,
      })
    );

    return jsonResponse(201, {
      success: true,
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error("createItem error:", error);

    return jsonResponse(500, {
      success: false,
      message: "Failed to create item",
      error: error.message,
    });
  }
};

module.exports.listItems = async () => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: ITEMS_TABLE,
      })
    );

    const items = result.Items || [];

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return jsonResponse(200, {
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("listItems error:", error);

    return jsonResponse(500, {
      success: false,
      message: "Failed to list items",
      error: error.message,
    });
  }
};
