const dotenv = require('dotenv');
dotenv.config();

var config = {

    hellosignKey: process.env.APIKEY,
    NDA_temp: process.env.NDA,
    MSA_temp: process.env.MSA,
    EMPACK_temp: process.env.EMPACK,
    WAIVER_temp: process.env.WAIVER

};

module.exports = config;
