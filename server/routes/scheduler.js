const schedule = require("node-schedule");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });
const mysql = require("mysql");


// 생명체 사망 api
exports.noti_schedule = schedule.scheduleJob({ hour: 14, minute: 30 }, function () {
  const pool = mysql.createPool({
    connectionLimit: 1,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  let today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  let day = today.getDay();
  console.log(day)

  let sql1;
    if (day === 0) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where sun = 1 and alien_status = 0 and practice_status = 0;';
    } else if (day === 1) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where mon = 1 and alien_status = 0 and practice_status = 0;';
    } else if (day === 2) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where tue = 1 and alien_status = 0 and practice_status = 0;';
    } else if (day === 3) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where wed = 1 and alien_status = 0 and practice_status = 0;';
    } else if (day === 4) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where thu = 1 and alien_status = 0 and practice_status = 0;';
    } else if (day === 5) {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where fri = 1 and alien_status = 0 and practice_status = 0;';
    } else {
      sql1 = 'SELECT challenge_id, id FROM aliens.alien where sat = 1 and alien_status = 0 and practice_status = 0;';
    }
    let challenge_alien = new Object();
    pool.getConnection(function(err, connection){
      if (err) throw err;
      
      connection.query(
        sql1, 
        function (error, results) {
          if (error) {
            console.error('at the scheduler api', error);
            return;
          }
          results.forEach(element => {
            _key = 'chal' + element.challenge_id;
            if (!challenge_alien.hasOwnProperty(_key)) {
              challenge_alien[_key] = {};
            }
            challenge_alien[_key][element.id] = true;
          });
          console.log(challenge_alien);
          connection.release();
        }
      )
    })
  
});

exports.dead_schedule = schedule.scheduleJob({ hour: 15, minute: 00 }, function () {
    const pool = mysql.createPool({
      connectionLimit: 1,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });
    // UTC를 위한 dirty code
    let today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    let day = today.getDay();
    // 일요일에 스케줄러가 돌면 토요일날 인증완료 여부를 파악하기 위해 한 칸씩 뒤로 된 것임.
    // 인증요청조차 하지 않은 생명체 죽음상태(status = 2)로 변경
    // 트리거를 통해 participant - 1
    // 트리거를 통해 user_info_has_challenge row 삭제
    // 인증요청, 완료한 생명체는 practice_status = 0로 변경
    let sql1;
    let sql2;
    if (day === 0) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (sat = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (sat = 1 AND alien_status = 0 AND practice_status != 0);';
    } else if (day === 1) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (sun = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (sun = 1 AND alien_status = 0 AND practice_status != 0);';

    } else if (day === 2) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (mon = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (mon = 1 AND alien_status = 0 AND practice_status != 0);';
    } else if (day === 3) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (tue = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (tue = 1 AND alien_status = 0 AND practice_status != 0);';
    } else if (day === 4) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (wed = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (wed = 1 AND alien_status = 0 AND practice_status != 0);';
    } else if (day === 5) {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (thu = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (thu = 1 AND alien_status = 0 AND practice_status != 0);';
    } else {
      sql1 = 'UPDATE alien SET alien_status = 2, end_date = NOW() WHERE (fri = 1 AND alien_status = 0 AND practice_status = 0);';
      sql2 = 'UPDATE alien SET practice_status = 0 WHERE (fri = 1 AND alien_status = 0 AND practice_status != 0);';
    }
  
    pool.getConnection(function(err, connection){
      if (err) throw err;
      
      connection.query(
        sql1 + sql2, 
        function (error, results) {
          if (error) {
            console.error('at the scheduler api', error);
            return;
          }
          console.log(results);
          connection.release();
        }
      )
    })
  });

