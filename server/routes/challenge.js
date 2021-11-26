const express = require("express");
const router = express.Router();
module.exports = function (pool) {
  router.get("/:challengeId", function (req, res) {
    console.log("/challenge/:challengeId", req.params.challengeId);
    pool.getConnection(function (err, connection) {
      if (err) throw err;
      // 1단계: challenge 정보 가져오기
      const { challengeId } = req.params;
      // TODO: 테이블 수정 전 임시로 column명 변경해둔 것 간결하게 구성하기
      let columns = `id, challengeName as challenge_name, challengeContent as challenge_content,\
                    maxUserNumber as max_user_number, participantNumber as participant_number,\
                    createDate as create_date, cntOfWeek as cnt_of_week`;
      let sql = `SELECT ${columns} FROM Challenge WHERE Challenge.id=${challengeId};`;
      connection.query(sql, function (err, results) {
        if (err) throw err;
        const challenge = results[0];
        if (!challenge) {
          res.status(400).json({
            result: "fail",
            msg: `challenge ${req.params.challengeId} not found`,
          });
          connection.release();
          return;
        }
        // 2단계: challenge에 포함된 alien들 가져오기
        // 1안 (현재): alien table과 user_info table을 join
        // 2안: alien table과 user_info_has_challange table, user_info table 각각에서 쿼리 수행 후 병합
        // TODO: 테이블 수정 전 임시로 column명 변경해둔 것 간결하게 구성하기
        let columns = `Alien.id, Challenge_id, createDate as create_date,\
                    alienName as alien_name, color, accuredAuthCnt as accured_auth_cnt, image_url,\
                    practice_status, end_date, status,\
                    time_per_week, sun, mon, tue, wed, thu, fri, sat,\
                    user_info_id, email, nickname as user_nickname`;
        let sql = `SELECT ${columns} FROM Alien LEFT JOIN user_info \
                ON Alien.user_info_id=user_info.id \
                WHERE Alien.Challenge_id=${challengeId} AND Alien.status=0;`;

        connection.query(sql, function (err, results) {
          if (err) throw err;
          results.forEach((alien) => {
            alien.challenge_name = challenge.challenge_name;
          });
          res.status(200).json({
            result: "success",
            msg: `request challengeId ${req.params.challengeId}`,
            challenge: challenge,
            aliens: results,
          });
          connection.release();
        });
      });
    });
  });

  // 챌린지 생성 api
  router.post("/create", function (req, res) {
    console.log(req.body);
    const max_user = parseInt(req.body.max_user);
    const cnt_of_week = parseInt(req.body.cnt_of_week);
    if (req.user) {
      pool.getConnection(function (err, connection) {
        connection.query(
          "INSERT INTO Challenge (challengeName, challengeContent, createUserNickName, maxUserNumber, cntOfWeek, tag) VALUES (?, ?, ?, ?, ?, ?)",
          [
            req.body.challenge_name,
            req.body.challenge_content,
            req.user.id,
            max_user,
            cnt_of_week,
            req.body.tag,
          ],
          function (err1, results1) {
            if (err1) {
              console.error(err);
              res.status(200).json({
                result: "fail",
                msg: "cant insert",
              });
              return;
            }
            res.status(200).json({
              result: "success",
              msg: "do insert",
              data: {
                challenge_id: results1.insertId,
                total_auth_cnt: cnt_of_week,
              },
            });
            connection.release();
          }
        );
      });
    } else {
      res.status(401).json({
        result: "fail",
        msg: "Unauthorized",
      });
    }
  });

  // 챌린지 total_auth_cnt 보내주기
  router.get("/totalAuthCnt/:challengeid", function (req, res) {
    const challengeId = req.params.challengeid;
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(err);
        res.status(500).json({
          result: "fail",
          msg: "cant connection",
        });
        return;
      }
      connection.query(
        "SELECT cntOfWeek FROM aliens.Challenge where id = ?;",
        [challengeId],
        function (error, results) {
          if (error) {
            console.error(error);
            res.status(200).json({
              result: "fail",
              msg: "cant query to select",
            });
            return;
          }
          res.status(200).json({
            result: "success",
            msg: "do insert",
            cntOfWeek: results[0].cntOfWeek,
          });
          connection.release();
        }
      );
    });
  });

  // 챌린지 인증 요청
  // Data Type : Front 쪽에서 data JSON Type으로 서버로 전달
  // var data = {user_info_id : 2, Alien_id : 2, Challenge_id : 2, requestUserNickname : 'john', imgURL : 'test_url' comment: 'comment'};
  router.post("/auth", function (req, res) {
    var data = req.body;
    const alien_id = req.body.Alien_id;
    data.request_user_nickname = req.user.nickname;
    console.log(req.user.nickname);
    console.log("서버 유저아이디 확인 :", data.user_info_id);
    var sql1 = `INSERT INTO Authentification SET ?;`;
    pool.getConnection(function (err, connection) {
      connection.query(sql1, data, function (error, results, fields) {
        if (error) {
          console.error(error);
          res.json({
            result: "fail",
            msg: "Fail to upload Information to Database.",
          });
          connection.release();
          return;
        }

        var sql2 = `UPDATE Alien SET practice_status = 1 where id = ${alien_id}`;
        connection.query(sql2, function (err, results, fields) {
          if (err) {
            console.error(err);
            res.json({
              result: "fail",
              msg: "Fail to update alien practice_status on Database.",
            });
            connection.release();
            return;
          }
          res.json({
            result: "success",
            msg: "인증요청이 완료되었습니다.",
          });
          connection.release();
          return;
          // ++추가구현 필요++ 동일한 챌린지의 멤버들이 접속중일 때, 실시간으로 연락이 갈 것. ( 해당 소켓의 room member에게 'msg' )
        });
      });
    });
  });
  router.post("/search", function (req, res) {
    var data = req.body;
    // console.log(data.keyword);
    pool.getConnection(function (err, connection) {
      connection.query(
        `select * from Challenge where challengeName regexp '${data.keyword}'`,
        function (err, results, fields) {
          if (err) {
            console.log(err);
            res.json({
              result: "fail",
              msg: "Fail to search",
            });
            connection.release();
            return;
          }
          res.json({ result: "success", challenge: results });
          connection.release();
        }
      );
    });
  });

  // 챌린지 인증 수락
  // auth data 에 수락표시 is auth 수정
  // alien에 accured auth count / week_auth_cnt 1씩 증가
  router.post("/approval", function (req, res) {
    const data = req.body;
    const auth_id = data.auth_id;
    const Alien_id = data.Alien_id;
    const request_date = data.request_date.split("T")[0].split("-");
    console.log(request_date);
    //1. 날짜 지난지 check 지났으면 Client에 메시지 return
    const request_month = request_date[1];
    const request_day = request_date[2];
    if (
      new Date().getMonth() + 1 != request_month ||
      new Date().getDate() > request_day
    ) {
      res.json({
        result: "fail",
        msg: "인증 수락 가능한 날짜가 만료되었습니다.",
      });
      return;
    }
    //2. Authentification id로 검색 후 수정 / 0 row changed -> Client notice.
    sql2 = `update Alien set accuredAuthCnt = accuredAuthCnt+1, practice_status=2 where id = ${Alien_id}`;
    sql1 = `update Authentification set isAuth = isAuth +1, response_date = NOW(), response_user_id = ${req.user.id}, response_user_nickname=${req.user.nickname} where id=${auth_id} and isAuth=0;`; // is Auth = 0 일때만 올리고 0 row 변하면 이미 완료된 요청입니다.
    pool.getConnection(function (err, connection) {
      connection.query(sql1, function (error, results, fields) {
        if (error) {
          console.error(error);
          res.json({
            result: "fail",
            msg: "[DB] Fail to update Database.",
          });
          return;
        }

        if (results.message.split("  ")[0] == "(Rows matched: 0") {
          res.json({
            result: "fail",
            msg: "이미 인증이 완료된 건 입니다.",
          });
          return;
        }
        connection.query(sql2, function (error, results, fields) {
          if (error) {
            res.json({
              result: "fail",
              msg: "[DB] Fail to update Database.",
            });
            return;
          }
          res.json({ result: "success" });
          connection.release();
        });
      });
    });
  });

  // router.get("/isAvailable/:challengeId", function (req, res) {
  //   pool.getConnection(function (err, connection) {
  //     sql = `SELECT if (maxUserNumber > participantNumber, "available","full") as result from Challenge where id=${req.params.challengeId};`;
  //     connection.query(sql, function (error, result, fields) {
  //       if (error) {
  //         console.error(error);
  //         res.json({
  //           result: "fail",
  //           msg: "[DB] Fail to confrim challenge information",
  //         });
  //         connection.release();
  //         return;
  //       }
  //       res.json(result);
  //       connection.release();
  //       return;
  //     });
  //   });
  // });

  router.use(function (req, res, next) {
    res.status(404).json({
      result: "fail",
      msg: "Sorry cant post that!",
    });
  });
  router.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
      result: "fail",
      msg: "Something broke!",
    });
  });
  return router;
};
