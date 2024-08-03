const { ContactUsModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Contact
 * @param {Object} requestBody
 * @returns {Promise<Contact>}
 */
const createContact = async (requestBody) => {
    const data = await ContactUsModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.CONTACT_CREATE };
};

/**
 * Query for Contacts
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryContact = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };

    if (options.searchBy && options.searchBy != 'undefined') {
        condition.$and.push({
            $or: [{
                name: {
                    $regex: '.*' + options.searchBy + '.*',
                    $options: 'si',
                }
            }, {
                email: {
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

    const data = await ContactUsModel.paginate(condition, options);
    return data;
};

/**
 * Get Contact by id
 * @param {ObjectId} id
 * @returns {Promise<Contact>}
 */
const getContactById = async (id) => {
    return await ContactUsModel.findById(id);
};


/**
 * Update Contact by id
 * @param {ObjectId} contactId
 * @param {Object} updateBody
 * @returns {Promise<Contact>}
 */
const updateContactById = async (contactId, updateBody) => {
    const data = await getContactById(contactId);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.CONTACT_NOT_FOUND };
    }
    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CONTACT_UPDATE };
};

/**
 * Delete Contact by id
 * @param {ObjectId} contactId
 * @returns {Promise<Contact>}
 */
const deleteContactById = async (contactId) => {
    const data = await getContactById(contactId);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.CONTACT_NOT_FOUND };
    }
    data.isDelete = 0;
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CONTACT_DELETE };
};


module.exports = {
    createContact,
    queryContact,
    getContactById,
    updateContactById,
    deleteContactById
};
