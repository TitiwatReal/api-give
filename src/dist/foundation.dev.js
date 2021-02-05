"use strict";

var mysql = require('mysql');

var connection = require('../condb');

var uploadImage = require('./upload-image');

var moment = require('moment');

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
  mysqlQuery('SELECT * FROM foundation ORDER BY id DESC').then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getList = function (req, res) {
  mysqlQuery('SELECT id,name FROM foundation').then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getById = function (req, res) {
  mysqlQuery('SELECT * FROM foundation WHERE id = ?', req.params.id).then(function (rows) {
    res.end(JSON.stringify(rows[0]));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.create = function _callee(req, res) {
  var file, file_name, body, data;
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          file = req.files.file;
          file_name = moment().unix();
          uploadImgFile(file, file_name);
          console.log(file_name);
          body = JSON.parse(req.body.data);
          data = {
            name: body.name,
            url: body.url,
            img: file_name + '.jpg'
          };
          _context2.next = 8;
          return regeneratorRuntime.awrap(mysqlQuery('INSERT INTO foundation SET ?', data).then(function (rows) {
            console.log('successs');
            res.send({
              id: rows.insertId
            });
          })["catch"](function (err) {
            return setImmediate(function () {
              throw err;
            });
          }));

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.edit = function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var data = [body.id_foundation, body.id_category, body.datetime, body.id_option, body.description, body.tel, body.sub_line_id, id];
  mysqlQuery('UPDATE foundation SET id_foundation= ? ,id_category= ? ,datetime= ?  ,id_option= ? ,description= ?,sub_line_id= ?,tel= ? , WHERE id = ?', data).then(function (rows) {
    // res.send(true);
    res.end(JSON.stringify(rows));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports["delete"] = function (req, res) {
  mysqlQuery('DELETE FROM foundation WHERE id = ?', req.params.id).then(function (result) {
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