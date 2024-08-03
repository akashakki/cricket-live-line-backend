const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { ContactUsService } = require('../services');
const CONSTANT = require('../config/constant');

const createContact = catchAsync(async (req, res) => {
    req.body['name'] = req.body.firstName + req.body.lastName ? (' ' + req.body.lastName) : '';
    var data = await ContactUsService.createContact(req.body);
    res.send(data);
});

const getContacts = catchAsync(async (req, res) => {
    const options = pick(req.query, [
        'sortBy',
        'limit',
        'page',
        'searchBy',
        'contactId',
        'status'
    ]);
    // options['userType'] = req.user.userType;
    const result = await ContactUsService.queryContact(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CONTACT_LIST });
});

const getContact = catchAsync(async (req, res) => {
    const data = await ContactUsService.getContactByIdWithPopulate(req.params.contactId, 'id');
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.CONTACT_NOT_FOUND });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CONTACT_DETAILS });
    }
});

const updateContact = catchAsync(async (req, res) => {
    var data = await ContactUsService.updateContactById(req.params.contactId, req.body)
    res.send(data);
});

const deleteContact = catchAsync(async (req, res) => {
    var details = await ContactUsService.deleteContactById(req.params.contactId, req.user);
    if (details) {
        res.send(details);
    } else {
        res.send(details);
    }
});



module.exports = {
    createContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact
};
