const AWS = require('aws-sdk');

const BUCKET_NAME = 'give-for-child';
const IAM_USER_KEY = 'AKIAIFPINJTXMA4SYMZQ';
const IAM_USER_SECRET = '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';

exports.uploadToS3 = (file, file_name) => {
  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
  });
  s3bucket.createBucket(function () {
    var params = {
      Bucket: BUCKET_NAME,
      Key: file_name,
      Body: file.data,
      ACL: 'public-read',
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log('error in callback');
        console.log(err);
      }
      console.log('success');
    });
  });
};
