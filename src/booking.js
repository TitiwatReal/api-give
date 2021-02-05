const moment = require('moment');
var mysql = require('mysql');
var connection = require('../condb');
const uploadImage = require('./upload-image');

const BANQUET = 'เลี้ยงอาหารเด็ก';
const REQUEST = 'จัดหาให้';
const BYMYSELF = 'นำมาเอง';

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
    mysqlQuery('SELECT * FROM booking')
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
    mysqlQuery('SELECT * FROM booking WHERE id = ?', req.params.id)
        .then(function (rows) {
            res.end(JSON.stringify(rows[0]));
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};
exports.getByFoundation = (req, res) => {
    mysqlQuery(
        'SELECT *,booking.id as booking_id,booking.name as booking_name,member.name as member_name FROM booking INNER JOIN member ON member.id = booking.member_id WHERE foundation = ?',
        req.params.foundation,
    )
        .then(function (rows) {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.getByMemberId = (req, res) => {
    mysqlQuery("SELECT * FROM booking WHERE member_id = ? AND is_success = '0'", req.params.id)
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
    mysqlQuery("SELECT * FROM booking WHERE member_id = ? AND is_success = '1'", req.params.id)
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
    let body = JSON.parse(req.body.data);
    const data = {
        member_id: body.member_id,
        foundation: body.foundation,
        category: body.category,
        option: body.option,
        name: body.name,
        tel: body.tel,
        date: body.date,
        location: body.location,
        description: body.description,
    };
    let file_name = '';
    if (body.option == REQUEST) {
        const file = req.files.file;
        file_name = moment().unix();

        uploadImgFile(file, file_name);
    }

    // img: file_name + '.jpg',

    mysqlQuery('INSERT INTO booking SET ?', data)
        .then(function (rows) {
            if (body.category === BANQUET) {
                const bookingId = rows.insertId;

                const banquet = {
                    duration: body.duration,
                    budget: body.budget,
                    slip: file_name + '.jpg',
                    booking_id: bookingId,
                };
                mysqlQuery('INSERT INTO banquet SET ?', banquet)
                    .then(function (rows) {})
                    .catch((err) =>
                        setImmediate(() => {
                            throw err;
                        }),
                    );
            }
            res.end('last ID: ' + rows.insertId);
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
        body.id_foundation,
        body.id_category,
        body.datetime,
        body.id_option,
        body.description,
        body.tel,
        body.sub_line_id,
        id,
    ];

    mysqlQuery(
        'UPDATE booking SET id_foundation= ? ,id_category= ? ,datetime= ?  ,id_option= ? ,description= ?,sub_line_id= ?,tel= ? , WHERE id = ?',
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

    mysqlQuery("UPDATE booking SET is_success = '1' WHERE id = ?", [id])
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
    mysqlQuery('DELETE FROM booking WHERE id = ?', req.params.id)
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

function uploadImgFile(file, file_name) {
    file.mv(`${__dirname}/../../front-web/public/resources/images/${file_name}.jpg`, (err) => {
        return false;
    });
    return true;
}
