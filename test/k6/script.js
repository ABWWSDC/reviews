
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '15s', target: 1000 },
    { duration: '60s', target: 1000 },
    // { duration: '600s', target: 5000 },
    { duration: '30s', target: 0 }
  ]
}

export default function () {
  var max = 5774900;
  var min = 1;
  var id = Math.floor(Math.random() * (max - min + 1)) + min;
  var res = http.get(`http://localhost:3000/reviews/?product_id=${id}`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}