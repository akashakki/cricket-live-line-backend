const { DisposableEmailModel } = require('../models');
const CONSTANT = require('../config/constant');
const fs = require('fs');
const path = require('path');

const create = async (requestBody) => {
    if (await DisposableEmailModel.isFieldValueTaken('domain', requestBody.domain)) {
        return { data: {}, code: 400, message: `${requestBody.domain} ${CONSTANT.ALREADY_EXISTS}` };
    } else {
        const data = await DisposableEmailModel.create(requestBody);
        return { data: data, code: 200, message: CONSTANT.CREATED };
    }
};


const query = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        condition.$and.push({
            $or: [{
                domain: {
                    $regex: '.*' + options.searchBy + '.*',
                    $options: 'si',
                }
            }]
        });
    }
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{ status: options.status }]
        });
    }

    options['sort'] = { createdAt: -1 };
    const data = await DisposableEmailModel.paginate(condition, options);
    return data;
};

const getById = async (id) => {
    return await DisposableEmailModel.findById(id);
};

const updateById = async (id, updateBody) => {
    const data = await getById(id);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND };
    }
    if (updateBody.domain && (await DisposableEmailModel.isFieldValueTaken('domain', updateBody.domain, id))) {
        return { data: {}, code: 400, message: `${updateBody.domain} ${CONSTANT.ALREADY_EXISTS}` };
    }
    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UPDATED };
};

const deleteById = async (id) => {
    const response = await getById(id);
    if (!response) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND };
    }
    // response.deleteOne();
    response.isDelete = 0;
    await data.save();
    return { data: response, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DELETED };
};

// Function to read JSON file
function readJsonFile(filepath) {
    try {
      const fileData = fs.readFileSync(filepath);
      return JSON.parse(fileData);
    } catch (err) {
      console.error('Error reading JSON file:', err);
      return null;
    }
  }

  // Function to check and insert records if count is 0
async function checkAndInsertRecords() {
    try {
      // Check count of documents in the collection
      const count = await DisposableEmailModel.countDocuments();
      console.log("🚀 ~ file: disposableEmailDomains.service.js:81 ~ checkAndInsertRecords ~ count:", count)
  
      if (count === 0) {
        // Path to your JSON file containing records
        const jsonFilePath = path.join(__dirname, '../helpers/disposable-email-domains.json'); // Update with your file path
        const domains = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

        // Convert domains to objects
        const domainObjects = domains.map(domain => ({ domain }));
  
  
        if (domainObjects && domainObjects.length > 0) {
          console.log("🚀 ~ file: disposableEmailDomains.service.js:93 ~ checkAndInsertRecords ~ domainsData:", domainObjects)
          // Insert records into the database
          await DisposableEmailModel.insertMany(domainObjects);
          console.log('Records inserted successfully from JSON file.');
        } else {
          console.log('JSON file is empty or data is invalid.');
        }
      } else {
        console.log('Records exist in the database. No action required.');
      }
    } catch (err) {
      console.error('Error checking and inserting records:', err);
    } finally {
      console.log('All records are created.')
    }
  }
  
  // Call the function to check and insert records
  // checkAndInsertRecords();

module.exports = {
    create,
    query,
    getById,
    updateById,
    deleteById
};
