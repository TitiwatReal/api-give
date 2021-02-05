var mysql = require('mysql');
var connection = require('../condb');
const uploadImage = require('./upload-image');
const moment = require('moment');

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
    mysqlQuery('SELECT * FROM foundation ORDER BY id DESC')
        .then((rows) => {
            res.send(rows);
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.getList = (req, res) => {
    mysqlQuery('SELECT id,name FROM foundation')
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
    mysqlQuery('SELECT * FROM foundation WHERE id = ?', req.params.id)
        .then(function (rows) {
            res.end(JSON.stringify(rows[0]));
        })
        .catch((err) =>
            setImmediate(() => {
                throw err;
            }),
        );
};

exports.create = async (req, res) => {
    const file = req.files.file;
    let file_name = moment().unix();

    uploadImgFile(file, file_name);
    console.log(file_name);
    const body = JSON.parse(req.body.data);
    let data = {
        name: body.name,
        url: body.url,
        img: file_name + '.jpg',
    };
    await mysqlQuery('INSERT INTO foundation SET ?', data)
        .then(function (rows) {
            console.log('successs');
            res.send({ id: rows.insertId });
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
        'UPDATE foundation SET id_foundation= ? ,id_category= ? ,datetime= ?  ,id_option= ? ,description= ?,sub_line_id= ?,tel= ? , WHERE id = ?',
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

exports.delete = (req, res) => {
    mysqlQuery('DELETE FROM foundation WHERE id = ?', req.params.id)
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
