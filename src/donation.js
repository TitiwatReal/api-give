var mysql = require('mysql');
var connection = require('../condb');
const uploadImage = require('./upload-image');

async function mysqlQuery(query, req) {
    return new Promise(function (resolve, reject) {
        connection.query(query, req, function (err, rows, fields) {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

exports.getAll = (req, res) => {
    mysqlQuery('SELECT * FROM donation')
        .then((rows) => {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.getById = (req, res) => {
    mysqlQuery('SELECT * FROM donation WHERE id = ?', req.params.id)
        .then(function (rows) {
            res.end(JSON.stringify(rows[0]));
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};
exports.getByMemberId = (req, res) => {
    mysqlQuery("SELECT * FROM donation WHERE member_id = ? AND is_success = '0'", req.params.id)
        .then(function (rows) {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.getByFoundation = (req, res) => {
    mysqlQuery('SELECT * FROM donation WHERE foundation = ? ', req.params.foundation)
        .then(function (rows) {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.getSuccessByMemberId = (req, res) => {
    mysqlQuery("SELECT * FROM donation WHERE member_id = ? AND is_success = '1'", req.params.id)
        .then(function (rows) {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.create = (req, res) => {
    const body = JSON.parse(req.body.body);
    let data = {
        member_id: body.member_id,
        name: body.name,
        tel: body.tel,
        foundation: body.foundation,
        date_time: body.date_time,
        location: body.location,
        description: body.description,
    };
    mysqlQuery('INSERT INTO donation SET ?', data)
        .then(function (rows) {
            // res.end(JSON.stringify(row));
            res.end('last ID: ' + rows.insertId);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
                s;
            }),
        );
};

exports.login = (req, res) => {
    const sub_line_id = req.body.sub_line_id;
    mysqlQuery('SELECT * FROM donation WHERE sub_line_id = ?', [sub_line_id])
        .then(function (rows) {
            if (rows[0]) {
                console.log('old');
                // const name = rows[0].name;
                // const img = rows[0].img;
                res.send({
                    name: req.body.name,
                    img: req.body.img,
                });
            } else {
                console.log('new account');
                const data = {
                    sub_line_id: req.body.sub_line_id,
                    img: req.body.img,
                    name: req.body.name,
                };
                mysqlQuery('INSERT INTO donation SET ?', data)
                    .then(function (rows) {
                        res.send(rows[0]);
                    })
                    .catch((err) =>
                        setImmediate(() => {
                            throw err;
                        }),
                    );
            }
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.edit = (req, res) => {
    const body = req.body;
    const id = req.params.id;
    let data = [
        body.name,
        body.foundation,
        body.tel,
        body.date_time,
        body.location,
        body.description,
        body.sub_line_id,
        id,
    ];

    mysqlQuery(
        'UPDATE donation SET name= ? ,foundation= ? ,tel= ? ,date_time= ?  ,location= ? ,description= ?,sub_line_id= ? , WHERE id = ?',
        data,
    )
        .then(function (rows) {
            // res.send(true);
            res.end(JSON.stringify(rows));
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.setSuccess = (req, res) => {
    const id = req.params.id;
    console.log(id);
    mysqlQuery("UPDATE donation SET is_success = '1' WHERE id = ?", [id])
        .then(function (rows) {
            res.send(true);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.delete = (req, res) => {
    mysqlQuery('DELETE FROM donation WHERE id = ?', req.params.id)
        .then(function (result) {
            res.end(JSON.stringify(result));
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.upload = (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file was uploaded' });
    }

    const file = req.files.file;
    uploadImage.uploadToS3(file);
    // file.mv(`${__dirname}/client/public/uploads/${file.name}`, (err) => {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send(err);
    //     }

    //     res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
    // });
};
