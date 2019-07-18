import '../styles/index.scss';
import _ from 'lodash';

let arr = [];

for (let i = 1; i < 10000; i++) arr.push({i});

function writeNext(i) {
    _.map(arr, i => i.i);
    document.write(i);
    if(i === 100) return;
    setTimeout(function() { writeNext(i + 1);}, 3000);
}

writeNext(1);

console.log('wow such JS much budget');
