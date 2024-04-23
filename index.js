const express = require("express");
const app = express();
const {faker} = require('@faker-js/faker');
const mysql = require ('mysql2');
let port =8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password:'password'
});

let getRandomUser = () =>  {
    return [
       faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
     faker.internet.password(),
    ];
  };

let q = "INSERT INTO user(id ,username ,email,password)VALUES ?";
// let user = [["12803","RaCVBghav","aCHbc@gmail.com","Dabc"],
//["189H3","RaghOav","aVVbc@gmail.com","Cabc"]];


// let data=[];
// for(let i=1;i<=100;i++){
//     data.push(getRandomUser());
// }

// try{
// connection.query(q,[data], (err,result)=>{
//     if(err){throw err};
//     console.log(result);
// });
// }catch(err){
//     console.log(err);
// }

//connection.end();

app.get("/",(req,res)=>{
    let q= "SELECT COUNT(*) FROM USER";
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let count = result[0]["COUNT(*)"];
            res.render("home.ejs",{count});
        })
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
    
});

//show route 
app.get("/user",(req,res)=>{
    let q = "SELECT id,email,username FROM USER";
    try{
        connection.query(q,(err,users)=>{
             if(err) throw err;
             //console.log(result);
             res.render("showusers.ejs",{users});
        })
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
   
})

//edit route
app.get("/user/:id/edit",(req,res)=>{
    let {id} =req.params;
    //console.log(id);
    let q = `SELECT * FROM user WHERE id= "${id}"`;
    try{
        connection.query(q,(err,result)=>{
             if(err) throw err;
            let user = result[0];
             res.render("edit.ejs",{user});
        })
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }

})
 //UPDATE ROUTE
 app.patch("/user/:id",(req,res)=>{
    //res.send("updated");
    let {id} =req.params;
    //form ka password
     let {password: formPass, username: newUsername}= req.body;
    //console.log(id);
    let q = `SELECT * FROM user WHERE id= "${id}"`;
    try{
        connection.query(q,(err,result)=>{
             if(err) throw err;
            let user = result[0];
            if(formPass!= user.password){
                res.send("wrong Password");
            }else{
                let q2 = `UPDATE user SET username = "${newUsername}" where id = "${id}"`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                });

            }
             //console.log(user);
        })
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
 })
//  console.log(getRandomUser());

//Delete a user complete row
app.get("/user/:id/delete",(req,res)=>{
    let {id} = req.params;
    //let q3= `delete from user where id="${id}"`;
    let q = `SELECT * from user where id = "${id}"`;

    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        res.render("delete.ejs" , {user} );
       
    });
});

app.delete("/user/:id/",(req,res)=>{
    let {id} = req.params;
    //console.log(id);
    let {email: formEmail, password:formPass} = req.body;
    // console.log(formEmail);
    // console.log(formPass);
    let q3 = `SELECT * FROM user where id = "${id}"`;
    connection.query(q3,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(formEmail == user.email && formPass == user.password){
            let q4 = `delete from user where id = "${id}"`;
            connection.query(q4,(err,result)=>{
                if(err) throw err;
                //console.log(result); 
                res.redirect("/user");
            })
        }else{
           res.send("DATABASE IS NOT USED"); 
        }

    })
    
    
})

//ADD NEW USER
app.get("/user/new",(req,res)=>{
      res.render("newUser.ejs");
});

app.post("/user",(req,res)=>{
    let formId = uuidv4();
     let {email:formemail, username:formuser, password:formpass} = req.body;
     
     let q = `INSERT INTO USER(ID,EMAIL,USERNAME,PASSWORD) VALUES ("${formId}","${formemail}","${formuser}","${formpass}")`;
    // let data = user[0];
     connection.query(q,(err,result)=>{
        if(err)throw err;
        res.redirect("/user");
     })
})
app.listen(port,()=>{
    console.log("APp is listening on the port");
})
