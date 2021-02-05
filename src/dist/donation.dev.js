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
  mysqlQuery('SELECT * FROM donation').then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getById = function (req, res) {
  mysqlQuery('SELECT * FROM donation WHERE id = ?', req.params.id).then(function (rows) {
    res.end(JSON.stringify(rows[0]));
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByMemberId = function (req, res) {
  mysqlQuery("SELECT * FROM donation WHERE member_id = ? AND is_success = '0'", req.params.id).then(function (rows) {
    res.send(rows);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.getByFoundation = function (req, res) {
  mysqlQuery('SELECT * FROM donation WHERE foundation = ? ', req.params.foundation).then(function (rows) {
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
  var body = JSON.parse(req.body.body);
  var data = {
    member_id: body.member_id,
    name: body.name,
    tel: body.tel,
    foundation: body.foundation,
    date_time: body.date_time,
    location: body.location,
    description: body.description
  };
  mysqlQuery('INSERT INTO donation SET ?', data).then(function (rows) {
    // res.end(JSON.stringify(row));
    res.end('last ID: ' + rows.insertId);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
      s;
    });
  });
};

exports.login = function (req, res) {
  var sub_line_id = req.body.sub_line_id;
  mysqlQuery('SELECT * FROM donation WHERE sub_line_id = ?', [sub_line_id]).then(function (rows) {
    if (rows[0]) {
      console.log('old'); // const name = rows[0].name;
      // const img = rows[0].img;

      res.send({
        name: req.body.name,
        img: req.body.img
      });
    } else {
      console.log('new account');
      var data = {
        sub_line_id: req.body.sub_line_id,
        img: req.body.img,
        name: req.body.name
      };
      mysqlQuery('INSERT INTO donation SET ?', data).then(function (rows) {
        res.send(rows[0]);
      })["catch"](function (err) {
        return setImmediate(function () {
          throw err;
        });
      });
    }
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports.edit = function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var data = [body.name, body.foundation, body.tel, body.date_time, body.location, body.description, body.sub_line_id, id];
  mysqlQuery('UPDATE donation SET name= ? ,foundation= ? ,tel= ? ,date_time= ?  ,location= ? ,description= ?,sub_line_id= ? , WHERE id = ?', data).then(function (rows) {
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
  mysqlQuery("UPDATE donation SET is_success = '1' WHERE id = ?", [id]).then(function (rows) {
    res.send(true);
  })["catch"](function (err) {
    return setImmediate(function () {
      throw err;
    });
  });
};

exports["delete"] = function (req, res) {
  mysqlQuery('DELETE FROM donation WHERE id = ?', req.params.id).then(function (result) {
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