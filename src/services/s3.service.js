const s3 = require('../lib/aws_S3');
const CONSTANT = require('../config/constant');

const uploadImage = async (req, path) => {
    const upload = await s3.uploadProfile(req, path)
    return upload;
}

const uploadDocuments = async (req, path, mineType,fileName=null) => {
    const upload = await s3.uploadDocuments(req, path, mineType,fileName)
    if (upload) {
        return upload;
    }
}

const deleteFromS3 = async (req) => {
    const deleteFile = await s3.deleteFromS3(req)
    if (deleteFile) {
        return deleteFile;
    }
}

const getUrlS3 = async (req) => {
    const url = await s3.getPreviewUrl(req)
    if (url) {
        return { data: url, code: CONSTANT.SUCCESSFUL, message: 'Preview URL.' };
    }
}

const getUrlS3Base64 = async (req) => {
    const url = await s3.getBase64FromS3(req)
    if (url) {
        return { data: url, code: CONSTANT.SUCCESSFUL, message: 'Preview URL.' };
    }
}

const getPlayableUrlS3 = async (req) => {
    const url = await s3.getPlayableUrlS3(req)
    if (url) {
        return url;
    }
}

const uploadBase64 = async (buffer, name, path) => {
    const url = await s3.uploadBufferUsingBase64(buffer, name, path)
    if (url) {
        return url
    }
}

const uploadImageUsingUrl = async (url, path, id) => {
    const data = await s3.uploadImageUsingURL(url, path, id)
    if (data) {
        return data
    }
}
const uploadImageUsingAnyURL = async (url, path) => {
    const data = await s3.uploadAnyImageUsingURL(url, path)
    if (data) {
        return data;
    }
}
const uploadBuffer = async (buffer, name, path) => {
    const url = await s3.uploadBufferPdf(buffer, name, path)
    if (url) {
        return url
    }
}
const downloadFileUrl = async (url) => {
    return await s3.getDownloadUrl(url)
    
}
module.exports = {
    downloadFileUrl,
    uploadImage,
    uploadDocuments,
    deleteFromS3,
    getUrlS3,
    getPlayableUrlS3,
    uploadBase64,
    uploadImageUsingUrl,
    uploadBuffer,
    uploadImageUsingAnyURL,
    getUrlS3Base64
}