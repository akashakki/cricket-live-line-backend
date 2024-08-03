const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { FAQService } = require('../services');
const CONSTANT = require('../config/constant');

const createFAQ = catchAsync(async (req, res) => {
    var data = await FAQService.createFAQ(req.body);
    res.send(data);
});

const getFAQs = catchAsync(async (req, res) => {
    const options = pick(req.query, [
        'sortBy',
        'limit',
        'page',
        'searchBy',
        'faqId',
        'status'
    ]);
    // options['userType'] = req.user.userType;
    const result = await FAQService.queryFAQ(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.FAQ_LIST });
});

const getFAQ = catchAsync(async (req, res) => {
    const data = await FAQService.getFAQByIdWithPopulate(req.params.faqId, 'id');
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.FAQ_NOT_FOUND });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.FAQ_DETAILS });
    }
});

const getFAQByCategory = catchAsync(async (req, res) => {
    const data = await FAQService.getFAQByCategory(req.params.categoryId);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.FAQ_NOT_FOUND });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.FAQ_DETAILS });
    }
});

const updateFAQ = catchAsync(async (req, res) => {
    var data = await FAQService.updateFAQById(req.params.faqId, req.body)
    res.send(data);
});

const deleteFAQ = catchAsync(async (req, res) => {
    var details = await FAQService.deleteFAQById(req.params.faqId, req.user);
    if (details) {
        res.send(details);
    } else {
        res.send(details);
    }
});

const getFAQsWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['searchBy', 'status']);

    // options['userType'] = req.user.userType;
    const result = await FAQService.queryFAQWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.FAQ_LIST });
});



module.exports = {
    createFAQ,
    getFAQs,
    getFAQ,
    getFAQByCategory,
    updateFAQ,
    deleteFAQ,
    getFAQsWithoutPagination
};
