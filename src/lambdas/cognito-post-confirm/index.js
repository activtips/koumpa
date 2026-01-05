/**
 * Cognito Post-Confirmation Trigger
 * Creates user record in DynamoDB after successful signup
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;
const DEFAULT_PLAN = 'free';
const DEFAULT_CREDITS = 3;

exports.handler = async (event, context) => {
  console.log('Cognito Post-Confirmation:', JSON.stringify(event, null, 2));

  // Only process confirmed signups
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    console.log('Skipping non-confirmation trigger:', event.triggerSource);
    return event;
  }

  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const name = event.request.userAttributes.name || email.split('@')[0];

  try {
    // Check if user already exists
    const existingUser = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId }
    }));

    if (existingUser.Item) {
      console.log('User already exists:', userId);
      return event;
    }

    // Create new user record
    const now = new Date().toISOString();
    const user = {
      userId,
      email,
      name,
      subscriptionPlan: DEFAULT_PLAN,
      creditsBalance: DEFAULT_CREDITS,
      creditsUsedToday: 0,
      projectsCreated: 0,
      banned: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    }));

    console.log('User created successfully:', userId);
  } catch (error) {
    // Log error but don't fail the signup
    console.error('Error creating user:', error);

    // If it's a condition check failure, user already exists - that's OK
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('User already exists (race condition handled)');
      return event;
    }

    // For other errors, still return success to not block signup
    // User will be created on first API call if needed
  }

  return event;
};
