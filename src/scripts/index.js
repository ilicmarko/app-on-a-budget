import '../styles/index.scss';
import _ from 'lodash';
import moment from 'moment';

console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));

let arr = [];

for (let i = 1; i < 10000; i++) arr.push({i});

_.map(arr, i => i);

console.log('wow such JS much budget');
