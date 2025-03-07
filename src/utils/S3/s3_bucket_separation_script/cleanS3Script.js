const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();
// Define the bucket name
const bucketName = process.env.ASSETBUCKET;

async function listAllObjects(bucketName) {
  const allObjects = [];

  async function listObjects(continuationToken) {
    const listObjectsParams = {
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    };

    const response = await s3.listObjectsV2(listObjectsParams).promise();
    const contents = response.Contents || [];

    contents.forEach((object) => {
      allObjects.push(object.Key);
    });

    if (response.IsTruncated) {
      // If there are more objects, continue listing
      await listObjects(response.NextContinuationToken);
    }
  }

  await listObjects();
  return allObjects;
}

async function deleteObjectsInBatches(objectsToDelete) {
  const batchSize = 1000; // Maximum objects that can be deleted in one request
  let startIndex = 0;

  while (startIndex < objectsToDelete.length) {
    const endIndex = Math.min(startIndex + batchSize, objectsToDelete.length);
    const batch = objectsToDelete.slice(startIndex, endIndex);

    if (batch.length > 0) {
      const deleteObjectsParams = {
        Bucket: bucketName,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
        },
      };

      try {
        const deletedObjects = await s3
          .deleteObjects(deleteObjectsParams)
          .promise();
        console.log('Deleted objects:', deletedObjects.Deleted);
      } catch (deleteError) {
        console.error('Error deleting objects:', deleteError);
        // Implement retry logic here if needed
      }
    }

    startIndex += batchSize;
  }
}

async function main() {
  try {
    // Read the objects to keep from the file
    const objectsToKeep = fs
      .readFileSync(objectsToKeepFile, 'utf-8')
      .split('\n')
      .map((object) => object.trim()); // Remove empty lines

    console.log('Objects to keep:', objectsToKeep);

    // List all objects in the bucket
    const allObjectKeys = await listAllObjects(bucketName);

    const objectsToKeepSet = new Set(objectsToKeep);

    // Identify objects to delete
    const objectsToDelete = allObjectKeys.filter(
      (key) => !objectsToKeepSet.has(key),
    );

    console.log('Objects to delete:', objectsToDelete);

    // Delete objects in batches
    await deleteObjectsInBatches(objectsToDelete);

    console.log('Deletion completed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Define the file containing the list of objects to keep
const objectsToKeepFile = process.env.TextFile;

// Run the script
main();
