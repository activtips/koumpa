/**
 * Base Repository
 * Abstract base class for DynamoDB repositories
 * Provides common CRUD operations
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand,
  QueryCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');
const { DatabaseError } = require('../errors');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    
    const client = new DynamoDBClient({
      // Enable connection reuse
      maxAttempts: 3,
      requestHandler: {
        connectionTimeout: 3000,
        requestTimeout: 3000
      }
    });
    
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      }
    });
  }

  /**
   * Get item by primary key
   */
  async get(key) {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: key
      });

      const response = await this.docClient.send(command);
      return response.Item || null;
    } catch (error) {
      throw new DatabaseError('get', error);
    }
  }

  /**
   * Put item (create or replace)
   */
  async put(item) {
    try {
      console.log('DynamoDB PUT - Table:', this.tableName);
      console.log('DynamoDB PUT - Item keys:', Object.keys(item));

      const command = new PutCommand({
        TableName: this.tableName,
        Item: item
      });

      await this.docClient.send(command);
      console.log('DynamoDB PUT - Success');
      return item;
    } catch (error) {
      console.error('DynamoDB PUT ERROR:', {
        table: this.tableName,
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code || error.$metadata?.httpStatusCode
      });
      throw new DatabaseError('put', error);
    }
  }

  /**
   * Update item
   */
  async update(key, updates) {
    try {
      const updateExpression = this.buildUpdateExpression(updates);
      
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: updateExpression.expression,
        ExpressionAttributeNames: updateExpression.names,
        ExpressionAttributeValues: updateExpression.values,
        ReturnValues: 'ALL_NEW'
      });

      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      throw new DatabaseError('update', error);
    }
  }

  /**
   * Delete item
   */
  async delete(key) {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: key
      });

      await this.docClient.send(command);
      return true;
    } catch (error) {
      throw new DatabaseError('delete', error);
    }
  }

  /**
   * Query with index
   */
  async query(params) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        ...params
      });

      const response = await this.docClient.send(command);
      return {
        items: response.Items || [],
        lastEvaluatedKey: response.LastEvaluatedKey
      };
    } catch (error) {
      throw new DatabaseError('query', error);
    }
  }

  /**
   * Scan table (use sparingly)
   */
  async scan(params = {}) {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        ...params
      });

      const response = await this.docClient.send(command);
      return {
        items: response.Items || [],
        lastEvaluatedKey: response.LastEvaluatedKey
      };
    } catch (error) {
      throw new DatabaseError('scan', error);
    }
  }

  /**
   * Build UpdateExpression from object
   */
  buildUpdateExpression(updates) {
    const keys = Object.keys(updates);
    
    const expression = `SET ${keys.map((key, i) => `#${key} = :${key}`).join(', ')}`;
    
    const names = keys.reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {});
    
    const values = keys.reduce((acc, key) => {
      acc[`:${key}`] = updates[key];
      return acc;
    }, {});

    return { expression, names, values };
  }

  /**
   * Conditional update (optimistic locking)
   */
  async conditionalUpdate(key, updates, condition) {
    try {
      const updateExpression = this.buildUpdateExpression(updates);
      
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: updateExpression.expression,
        ExpressionAttributeNames: updateExpression.names,
        ExpressionAttributeValues: updateExpression.values,
        ConditionExpression: condition.expression,
        ReturnValues: 'ALL_NEW'
      });

      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new DatabaseError('Conditional check failed - item may have been modified');
      }
      throw new DatabaseError('conditional update', error);
    }
  }

  /**
   * Batch get items
   */
  async batchGet(keys) {
    try {
      const command = new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: keys
          }
        }
      });

      const response = await this.docClient.send(command);
      return response.Responses[this.tableName] || [];
    } catch (error) {
      throw new DatabaseError('batch get', error);
    }
  }
}

module.exports = BaseRepository;
