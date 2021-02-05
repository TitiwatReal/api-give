"use strict";

var mysql = require('mysql');

var connection = require('../condb');

var uploadImage = require('./upload-image');

function mysqlQuery(query, req) {
  return regeneratorRuntime.async(function mysqlQuery$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", new Promise(function (resolve, reject) {
            connection.query(query, req, function (err, rows, fields) {
              if (err) {
                return reject(err);
              }

              resolve(rows);
            });
          }));

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
}

exports.getAll = function (req, res) {
  mysqlQuery('SELECT * FROM join_activity').then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getById = function (req, res) {
  mysqlQuery('SELECT * FROM join_activity WHERE id = ?', req.params.id).then(function (rows) {
    res.end(JSON.stringify(rows[0]));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByFoundation = function (req, res) {
  mysqlQuery('SELECT *, member.name as member_name,activity.name as activity_name,join_activity.id as join_id FROM join_activity INNER JOIN activity ON activity.id = join_activity.activity_id INNER JOIN foundation ON foundation.name = activity.foundation INNER JOIN member ON member.id = join_activity.member_id WHERE foundation.name = ?', req.params.foundation).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByMemberId = function (req, res) {
  mysqlQuery("SELECT * FROM join_activity WHERE member_id = ? AND is_success = '0'", req.params.id).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getSuccessByMemberId = function (req, res) {
  mysqlQuery("SELECT * FROM donation WHERE member_id = ? AND is_success = '1'", req.params.id).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.create = function (req, res) {
  mysqlQuery('INSERT INTO join_activity SET ?', req.body).then(function (rows) {
    // res.end(JSON.stringify(row));
    res.end('last ID: ' + rows.insertId);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.edit = function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var data = [body.activity_id, body.member_id, id];
  mysqlQuery('UPDATE join_activity SET 	activity_id= ? ,	member_id= ?  WHERE id = ?', data).then(function (rows) {
    // res.send(true);
    res.end(JSON.stringify(rows));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.setSuccess = function (req, res) {
  var id = req.params.id;
  console.log(id);
  mysqlQuery("UPDATE join_activity SET is_success = '1' WHERE id = ?", [id]).then(function (rows) {
    res.send(true);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports["delete"] = function (req, res) {
  mysqlQuery('DELETE FROM join_activity WHERE id = ?', req.params.id).then(function (result) {
    res.end(JSON.stringify(result));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.upload = function (req, res) {
  if (req.files === null) {
    return res.status(400).json({
      msg: 'No file was uploaded'
    });
  }

  var file = req.files.file;
  uploadImage.uploadToS3(file); // file.mv(`${__dirname}/client/public/uploads/${file.name}`, (err) => {
  //     if (err) {
  //         console.error(err);
  //         return res.status(500).send(err);
  //     }
  //     res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  // });
};