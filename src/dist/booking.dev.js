"use strict";

var moment = require('moment');

var mysql = require('mysql');

var connection = require('../condb');

var uploadImage = require('./upload-image');

var BANQUET = 'เลี้ยงอาหารเด็ก';
var REQUEST = 'จัดหาให้';
var BYMYSELF = 'นำมาเอง';

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
  mysqlQuery('SELECT * FROM booking').then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getById = function (req, res) {
  mysqlQuery('SELECT * FROM booking WHERE id = ?', req.params.id).then(function (rows) {
    res.end(JSON.stringify(rows[0]));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByFoundation = function (req, res) {
  mysqlQuery('SELECT *,booking.id as booking_id,booking.name as booking_name,member.name as member_name FROM booking INNER JOIN member ON member.id = booking.member_id WHERE foundation = ?', req.params.foundation).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByMemberId = function (req, res) {
  mysqlQuery("SELECT * FROM booking WHERE member_id = ? AND is_success = '0'", req.params.id).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getSuccessByMemberId = function (req, res) {
  mysqlQuery("SELECT * FROM booking WHERE member_id = ? AND is_success = '1'", req.params.id).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.create = function (req, res) {
  var body = JSON.parse(req.body.data);
  var data = {
    member_id: body.member_id,
    foundation: body.foundation,
    category: body.category,
    option: body.option,
    name: body.name,
    tel: body.tel,
    date: body.date,
    location: body.location,
    description: body.description
  };
  var file_name = '';

  if (body.option == REQUEST) {
    var file = req.files.file;
    file_name = moment().unix();
    uploadImgFile(file, file_name);
  } // img: file_name + '.jpg',


  mysqlQuery('INSERT INTO booking SET ?', data).then(function (rows) {
    if (body.category === BANQUET) {
      var bookingId = rows.insertId;
      var banquet = {
        duration: body.duration,
        budget: body.budget,
        slip: file_name + '.jpg',
        booking_id: bookingId
      };
      mysqlQuery('INSERT INTO banquet SET ?', banquet).then(function (rows) {})["catch"](function (err) {
        return setImmediate(function () {
          throw err;
        });
      });
    }

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
  var data = [body.id_foundation, body.id_category, body.datetime, body.id_option, body.description, body.tel, body.sub_line_id, id];
  mysqlQuery('UPDATE booking SET id_foundation= ? ,id_category= ? ,datetime= ?  ,id_option= ? ,description= ?,sub_line_id= ?,tel= ? , WHERE id = ?', data).then(function (rows) {
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
  mysqlQuery("UPDATE booking SET is_success = '1' WHERE id = ?", [id]).then(function (rows) {
    res.send(true);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports["delete"] = function (req, res) {
  mysqlQuery('DELETE FROM booking WHERE id = ?', req.params.id).then(function (result) {
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

function uploadImgFile(file, file_name) {
  file.mv("".concat(__dirname, "/../../front-web/public/resources/images/").concat(file_name, ".jpg"), function (err) {
    return false;
  });
  return true;
}