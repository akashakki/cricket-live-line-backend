const { ContactUsModel } = require('../models');
const CONSTANT = require('../config/constant');
const CONFIG = require('../config/config');
const baseURL = CONFIG?.CRICKET_CHAMPION_API_URL//'https://apicricketchampion.in/apiv4/';
const token = CONFIG?.CRICKET_CHAMPION_TOKEN//'deed03c60ab1c13b1dbef6453421ead6';
const axios = require('axios');
const FormData = require('form-data');
const heroAPIBaseURL = CONFIG?.HERO_API_BASE_URL//'https://app.heroliveline.com/csadmin/api/'


const globalFunctionFetchDataFromAPI = async (key, value, endpoint, method) => {
    try {
        const formData = new FormData();
        if (key == 'multiple') {
            const params = value;
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    formData.append(key, params[key]);
                }
            }
        } else {
            formData.append(key, value); // Add match_id to formdata
        }

        let config = {
            method,
            maxBodyLength: Infinity, // Allow large request bodies if needed
            url: `${baseURL}${endpoint}/${token}`, // Your API endpoint
            headers: {
                ...formData.getHeaders() // Ensure correct headers for FormData, including Content-Type
            },
            data: formData // Send the FormData object as the request body
        };

        const response = await axios.request(config);
        const data = response.data?.data;
        return data;
    } catch (error) {
        console.error('Error making API call Global Service 39:', error?.response);
        return [];
    }
}

const globalFunctionFetchDataFromAPIGETMethod = async (endpoint) => {
    try {
        const response = await axios.get(`${baseURL}${endpoint}/${token}`)
        const data = response.data?.data;
        return data;
    } catch (error) {
        console.error('Error making API call Global Service 50:', error);
    }
}

const globalFunctionFetchDataFromHeroGETMethod = async (endpoint) => {
    try {
        const response = await axios.get(`${heroAPIBaseURL}${endpoint}`)
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error making API call Global Service 60:', error);
    }
}

const globalFunctionFetchDataFromHeroPostMethod = async (value, endpoint, method) => {
    // console.log("🚀 ~ file: global.service.js:55 ~ globalFunctionFetchDataFromHeroPostMethod ~ value:", value)
    try {
        let config = {
            method: method,
            maxBodyLength: Infinity, // Allow large request bodies if needed
            // url: `${heroAPIBaseURL}web/getmatchlisting/`, // Your API endpoint
            url: `${heroAPIBaseURL}${endpoint}`, // Your API endpoint
            data: value //{ "match_status": "All" } // Send the FormData object as the request body
        };

        const response = await axios.request(config);
        return response?.data;
    } catch (error) {
        console.error('Error making API call Global Service 78:', error);
    }
}

module.exports = {
    globalFunctionFetchDataFromAPI,
    globalFunctionFetchDataFromAPIGETMethod,
    globalFunctionFetchDataFromHeroGETMethod,
    globalFunctionFetchDataFromHeroPostMethod
};
