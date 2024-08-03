var AWS = require('aws-sdk');
const config = require('../config/config');
const CONSTANT = require('../config/constant');
var request = require('request');
const { ProductModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
// const sharp = require('sharp');

console.log('config===', config.S3_BUCKET, config.ACCESS_KEY, config.SECRET_KEY);
AWS.config.update({
  accessKeyId: config.ACCESS_KEY,
  secretAccessKey: config.SECRET_KEY,
  region: config.S3_REGION,
});

var s3 = new AWS.S3();

const uploadProfile = async (file, path) => {
  // Setting up S3 upload parameters
  try {
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: config.S3_BUCKET + path,
      Key: uniqueFileName,
      ContentType: file.mimetype,
      Body: file.buffer,
    };
    var data = await s3.upload(params).promise();
    // var url = await s3.getSignedUrl("getObject", {
    //     Bucket: config.S3_BUCKET,
    //     Key: data.Key,
    // });
    // return url;
    return { data: data };
  } catch (err) {
    console.log(err);
  }
  //s3.deleteObject for delete file on s3
};

const uploadDocuments = async (files, path, mineType, filename) => {
  const uploadPromises = files.map(async (file) => {
    console.log('check file===', mineType, file?.mimetype, file.originalname);
    const uniqueFileName = filename ? filename + '.' + file.mimetype.split('/')[1] : `${uuidv4()}-${file.originalname}`;
    // console.log(filename,'>>>>>>>');
    const params = {
      Bucket: `${config.S3_BUCKET}/${path}`,
      Key: uniqueFileName,
      ContentType: mineType || file.mimetype,
      Body: file.buffer,
    };

    try {
      const data = await s3.upload(params).promise();
      const response = {
        mimetype: params.ContentType,
        key: data.Key,
        bucket: data.Bucket,
        location: data.Location,
        fieldname: file.fieldname,
      };
      return response;
    } catch (err) {
      console.log(err);
      return null;
    }
  });

  try {
    const responseData = await Promise.all(uploadPromises);
    console.log('All files uploaded');
    return responseData.filter((response) => response !== null);
  } catch (err) {
    console.log(err);
    return [];
  }
};
// const uploadDocuments = async (files, path, mineType,download) => {
//   const uploadPromises = files.map(async (file) => {
//     console.log('check file===', mineType, file?.mimetype, file.originalname);
//     const uniqueFileName = `${uuidv4()}-${file.originalname}`;
//     const params = {
//       Bucket: `${config.S3_BUCKET}/${path}`,
//       Key: uniqueFileName,
//       ContentType: mineType || file.mimetype,
//       Body: file.buffer,
//     };

//     try {
//       const data = await s3.upload(params).promise();
//       const response = {
//         mimetype: params.ContentType,
//         key: data.Key,
//         bucket: data.Bucket,
//         location: data.Location,
//         fieldname: file.fieldname,
//       };
//       if (download) {
//         // Generate a pre-signed URL for downloading the uploaded file
//         const oneWeekInSeconds = 60 * 60 * 24 * 7; // One week in seconds

//         const downloadParams = {
//           Bucket: data.Bucket,
//           Key: data.Key,
//           Expires: oneWeekInSeconds,
//           ResponseContentDisposition: 'attachment', // URL will expire in 1 Week (adjust as needed)
//         };
//         const downloadUrl = s3.getSignedUrl('getObject', downloadParams);
//         response.downloadUrl = downloadUrl;
//       }

//       return response;
//     } catch (err) {
//       console.log(err);
//       return null;
//     }
//   });

//   try {
//     const responseData = await Promise.all(uploadPromises);
//     console.log('All files uploaded');
//     return responseData.filter((response) => response !== null);
//   } catch (err) {
//     console.log(err);
//     return [];
//   }
// };

const deleteFromS3 = async (path) => {
  var data;
  try {
    if (typeof path === 'string') {
      console.log('===========',path.split('/'));
      const params = {
        Bucket: config.S3_BUCKET + '/' + path.split('/')[0],
        Key: path.split('/')[1],
      };
      var data = await s3.deleteObject(params).promise();
    } else {
      path.forEach(async (result) => {
        const params = {
          Bucket: config.S3_BUCKET + '/' + result.split('/')[0],
          Key: result,
        };
        data = await s3.deleteObject(params).promise();
      });
    }

    return { data: data, code: CONSTANT.SUCCESSFUL, message: 'File Delete Successfully' };
  } catch (err) {
    console.log(err);
    return { data: err, code: CONSTANT.SUCCESSFUL, message: 'Check if you have sufficient permissions : ' + err };
  }
};

const getPreviewUrl = async (item) => {
  var url = await s3.getSignedUrl('getObject', { Bucket: config.S3_BUCKET, Key: item });
  // console.log('url=========', url)
  return url;
};

const getBase64FromS3 = async (key)=>{
  const params = { Bucket: config.S3_BUCKET, Key: key };

  try {
    const { Body } = await s3.getObject(params).promise();
    if (Body instanceof Buffer) {
      return Body.toString('base64');
    } else {
      throw new Error('File content is not a Buffer.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const getPlayableUrlS3 = async (item) => {
  const params = {
    Bucket: config.S3_BUCKET,
    CopySource: config.S3_BUCKET + '/' + item,
    Key: item,
    MetadataDirective: 'REPLACE',
    Metadata: {
      'Content-Disposition': 'inline',
    },
  };
  console.log('params----------', params);
  //    var url = await s3.copyObject(params);
  // return url;
  s3.copyObject(params, (err, data) => {
    if (err) {
      console.error('Error updating Content-Disposition:', err);
    } else {
      console.log('Content-Disposition updated successfully', data);
    }
  });
};

const uploadBufferPdf = async (buf, name, path) => {
  // Setting up S3 upload parameters
  try {
    const params = {
      Bucket: config.S3_BUCKET + path,
      Key: name,
      ContentEncoding: 'base64',
      ContentType: 'application/pdf',
      Body: buf,
    };
    var data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    console.log(err);
  }
};
const uploadBufferUsingBase64 = async (buffer, name, path) => {
  try {
    console.log(name, config.S3_BUCKET + path);
    let fileName = `${uuidv4()}-${name}`
    var buf = Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const params = {
      Bucket: `${config.S3_BUCKET}/${path}`, //config.S3_BUCKET + path,
      Key: fileName,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
      Body: buf,
    };
    var data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    console.log(err);
  }
};

const uploadImageUsingURL = async (url, path, id) => {
  try {
    // console.log(config.S3_BUCKET + path);
    request({ url: url, encoding: null }, async function (err, res, body) {
      if (err) return {};
      var nameArray = url.split('/');
      var name = nameArray[nameArray.length - 1];
      // console.log('name====', name)
      const params = {
        Bucket: config.S3_BUCKET + path,
        Key: name,
        ContentType: res.headers['content-type'],
        ContentLength: res.headers['content-length'],
        Body: body,
      };
      // console.log('params===',params)
      await s3
        .upload(params)
        .promise()
        .then(async (data) => {
          // console.log('data====', data, id)
          if (data && data.key) {
            console.log('key----------', data.key);
            var productUpdate = await ProductModel.findByIdAndUpdate(
              { _id: id },
              { $set: { images: [data.key], imageUrl: '' } }
            );
            // console.log('productUpdate===', productUpdate)
          }
          return data;
        });
    });
    // console.log('resData===', resData)
  } catch (err) {
    console.log('erpppppppppp', err);
  }
};
const uploadAnyImageUsingURL = async (url, path) => {
  try {
    const res = await fetch(url);
    const blob = await res.arrayBuffer();

    const uniqueId = uuidv4();
    if (res.headers.get('content-type')) {
      const extension = res.headers.get('content-type').split('/')[1];
      const uniqueFileName = `${uniqueId}.${extension}`;

      const params = {
        Bucket: config.S3_BUCKET + '/' + path,
        Key: uniqueFileName,
        ContentType: res.headers.get('content-type'),
        ContentLength: res.headers.get('content-length'),
        Body: Buffer.from(new Uint8Array(blob)), // Convert Uint8Array to Buffer
      };

      var uploadResponse = await s3.upload(params).promise();

      // Extract the key from the response and return it
      return uploadResponse.Key;
    }else{
      return 0;
    }
  } catch (err) {
    return 0;
  }
};

const getDownloadUrl = async (path) => {
  const expiration = 7 * 24 * 60 * 60; // 1 week in seconds

  const params = {
    Bucket: `${config.S3_BUCKET}/${path.split('/')[0]}`,
    Key: path.split('/')[1],
    ResponseContentDisposition: 'attachment',
    Expires: expiration,
  };
  const downloadUrl = s3.getSignedUrlPromise('getObject', params);
  return downloadUrl;
};

module.exports = {
  getDownloadUrl,
  uploadProfile,
  uploadDocuments,
  deleteFromS3,
  getPreviewUrl,
  uploadBufferPdf,
  uploadBufferUsingBase64,
  uploadImageUsingURL,
  uploadAnyImageUsingURL,
  getPlayableUrlS3,
  getBase64FromS3
};
