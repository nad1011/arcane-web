const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dan10112003', 
    database: 'user',
});
connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    // console.log('db ' + connection.state);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllProduct() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM product WHERE quantity != 0;";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getProduct(id) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM product WHERE id = ?;";
                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllCart(code) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM cart WHERE lading_code = ?;";
                connection.query(query, [code] ,(err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async pay(username,lading_code,total_price,date_time) {
        try {
            const response = await new Promise((resolve, reject) => {
                //take userID
                const query = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query, [username] , (err, res) => {
                    if (err) reject(new Error(err.message));
                    const query1 = "SELECT * FROM cart WHERE lading_code = ?"
                    connection.query(query1, [lading_code] , (err1, res1) => {
                        if (err1) reject(new Error(err1.message));
                        for (var index of res1) {
                            const queryPrd = "SELECT * FROM product WHERE id = ?";
                            connection.query(queryPrd,[index.productID],(errPrd,resPrd)=>{
                                if (errPrd) reject(new Error(errPrd.message));
                                if (resPrd[0].quantity < index.amount) {
                                    resolve(-1);
                                    reject();
                                }
                                else { 
                                    const queryUpdate = "UPDATE product SET quantity = ? WHERE id = ?";
                                    connection.query(queryUpdate,[parseInt(resPrd[0].quantity)-parseInt(index.amount),index.productID],(errUpd,resUpd)=>{
                                        if (errUpd) reject(new Error(errUpd.message));
                                        //resolve(1);
                                    })
                                }
                            })
                        }
                        const queryPay = "INSERT INTO user_order (recipientID, lading_code, total_price, date_time) VALUES (?,?,?,?);";
                        connection.query(queryPay, [res[0].id,lading_code,total_price,date_time] , (errPay, resultPay) => {
                            if (errPay) reject(new Error(errPay.message));
                            resolve(resultPay.insertId);
                        })
                    })
                })
            });

            return response;
            
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewUser(username,email,password,lading_code) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query1, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    if (Object.keys(result).length != 0) {
                        resolve(-1);
                    } else {
                        //insert into lading codes
                        const query2 = "INSERT INTO user_infor (username, email, password) VALUES (?,?,?);";
                        connection.query(query2, [username,email,password] , (err1, result1) => {
                            if (err1) reject(new Error(err1.message));
                            const query3 = "INSERT INTO lading_codes (lading_code, user_id) VALUES (?,?);";
                            console.log(result1);
                            connection.query(query3, [lading_code,result1.insertId] , (err2, result2) => {
                                if (err2) reject(new Error(err2.message));
                                resolve(result1.insertId);
                            })
                        })
                    }
                })
            });
            if (insertId == -1) return null; 
            else return {
                id : insertId,
                username : username,
                email : email,
                password : password
            };
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewProduct(name, price, image, sellerUsername, quantity) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query1, [sellerUsername] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    const query2 = "INSERT INTO product (name, img, price, sellerID, quantity) VALUES (?,?,?,?,?);";
                    connection.query(query2, [name,image,price,result[0].id,quantity] , (err1, result1) => {
                        if (err1) reject(new Error(err1.message));
                        resolve(result1.id);
                    })
                })
            });
            return {
                id : insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async userLogin(username,password) {
        try {
            const code = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM user_infor WHERE username = ?";
                connection.query(query, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    if (Object.keys(result).length == 0) {
                        resolve(-1);
                    }
                    else {
                        if (result[0].password != password) resolve(-1);
                        else {
                            const query1 = "SELECT lading_code,MAX(date_time) FROM lading_codes where user_id = ?";
                            connection.query(query1, [result[0].id], (err1, result1) => {
                                if (err1) reject(new Error(err1.message));
                                resolve(result1[0].lading_code);
                            })
                        }
                        
                    }
                })
            });
            if (code == -1) return null; 
            else return {
                code : code,
                username : username,
                password : password
            };
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewCart(name, amount, price, username, code) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                var lading_code = code;
                var userID;
                var productID;
                const query2 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query2, [username] , (err1, result1) => {
                    if (err1) reject(new Error(err1.message));
                    userID = result1[0]['id'];
                })
                const query3 = "SELECT * FROM product WHERE name = ?"
                connection.query(query3, [name] , (err2, result2) => {
                    if (err2) reject(new Error(err2.message));
                    productID = result2[0]['id'];
                    const query4 = "INSERT INTO cart (lading_code, userID, productID, amount, price) VALUES (?,?,?,?,?);";
                    connection.query(query4, [lading_code,userID,productID,amount,price] , (err3, result3) => {
                        if (err3) reject(new Error(err3.message));
                        resolve(result3.cartID);
                    })
                })
            });
            return {
                id : insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async deleteRowById(id) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM cart WHERE cartID = ?";
    
                connection.query(query, [id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(1);
                })
            });
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async reset(username,lading_code) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM user_infor WHERE username = ?";
                connection.query(query, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    const query1 = "INSERT INTO lading_codes (lading_code, user_id) VALUES (?,?);";
                    connection.query(query1, [lading_code,result[0].id] , (err1, result1) => {
                        if (err1) reject(new Error(err1.message));
                        resolve(result1.insertId)
                    });
                });
            });
            return insertId;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;