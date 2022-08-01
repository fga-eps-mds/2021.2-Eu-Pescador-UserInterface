import axios from 'axios';
const config = require('../../../config');

const wikiService = axios.create({
  baseURL: `https://fish-wiki-2022-1.herokuapp.com`,
});

export default wikiService;
