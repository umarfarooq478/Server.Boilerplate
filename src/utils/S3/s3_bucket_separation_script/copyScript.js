const AWS = require('aws-sdk');
require('dotenv').config();

// Setting AWS credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

// Function to delete all objects from a bucket
async function deleteAllObjects(bucketName) {
  const objectsToDelete = await s3
    .listObjectsV2({ Bucket: bucketName })
    .promise();

  if (objectsToDelete.Contents.length === 0) {
    console.log(`No objects found in bucket: ${bucketName}`);
    return;
  }
  const objectKeys = objectsToDelete.Contents.map((object) => ({
    Key: object.Key,
  }));
  const deleteParams = {
    Bucket: bucketName,
    Delete: { Objects: objectKeys },
  };

  await s3.deleteObjects(deleteParams).promise();
  console.log(
    `Deleted ${objectKeys.length} objects from bucket: ${bucketName}`,
  );
}

// Function to recursively copy objects from one bucket to another
async function copyAllObjects(
  sourceBucket,
  destinationBucket,
  prefix = '',
  continuationToken,
) {
  const not_copied = [];
  const listParams = {
    Bucket: sourceBucket,
    Prefix: prefix,
    ContinuationToken: continuationToken, // Add ContinuationToken to fetch more objects
  };

  const sourceObjects = await s3.listObjectsV2(listParams).promise();
  console.log(sourceObjects.Contents.length);
  const copyPromises = [];
  let folderCount = 0;
  let fileCount = 0;

  for (const object of sourceObjects.Contents) {
    const copyParams = {
      Bucket: destinationBucket,
      CopySource: `${sourceBucket}/${object.Key}`,
      Key: object.Key,
    };

    const copyPromise = s3
      .copyObject(copyParams)
      .promise()
      .catch(() => {
        not_copied.push(object.Key);
      });
    copyPromises.push(copyPromise);
    fileCount++;
  }

  await Promise.all(copyPromises);
  console.log(not_copied.length);
  console.log(not_copied);

  // Check if there are more objects to fetch
  if (sourceObjects.IsTruncated) {
    await copyAllObjects(
      sourceBucket,
      destinationBucket,
      prefix,
      sourceObjects.NextContinuationToken,
    );
  }

  // Rest of the code for copying subfolders and files
  for (const commonPrefix of sourceObjects.CommonPrefixes) {
    const subfolderName = commonPrefix.Prefix;
    const { folderCount: subfolderCount, fileCount: subfolderFileCount } =
      await copyAllObjects(sourceBucket, destinationBucket, subfolderName);
    folderCount++;
    fileCount += subfolderFileCount;
  }

  console.log(`Copied ${fileCount} files in folder: ${prefix || 'root'}`);
}

async function scripting() {
  const sourceBucket = process.argv[2];
  const destinationBucket = process.argv[3];
  const overwrite = process.env.OVERWRITE;

  // Check if the source bucket exists
  try {
    await s3.headBucket({ Bucket: sourceBucket }).promise();
  } catch (error) {
    if (error.statusCode === 404) {
      console.log('Source bucket does not exist');
      return;
    } else {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      return;
    }
  }

  // Check if the destination bucket exists
  try {
    await s3.headBucket({ Bucket: destinationBucket }).promise();
  } catch (error) {
    if (error.statusCode === 404) {
      // Destination bucket doesn't exist, create it
      await s3.createBucket({ Bucket: destinationBucket }).promise();
    } else {
      console.error('Error:', error);
      return;
    }
  }

  if (overwrite === 'true') {
    // Delete all objects in the destination bucket
    await deleteAllObjects(destinationBucket);
  }

  // Start copying objects
  await copyAllObjects(sourceBucket, destinationBucket);
}

scripting().catch((error) => {
  console.error('An error occurred:', error);
});
