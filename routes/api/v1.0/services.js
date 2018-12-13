var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
//var _ = require("underscore");
var RESTAURANT = require("../../../database/collections/../../database/collections/restaurant");
var MENUS = require("../../../database/collections/../../database/collections/menus");
var CLIENT = require("../../../database/collections/../../database/collections/client");

var ORDERS = require("../../../database/collections/../../database/collections/orders");

var jwt = require("jsonwebtoken");


var storage = multer.diskStorage({
  destination: "./public/restaurants",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});
var upload = multer({
  storage: storage
}).single("img");;

/*
Login PARA CLIENTES
*/

//Middelware
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autotizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "seponeunallavesecreta", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autotizado"
          })
        } else {
          next();
        }
      });
  }
}


/*

//CRUD Create, Read, Update, Delete
//Creation of users
router.post(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({
        "msn" : "No se ha podido subir la imagen"
      });
    } else {
      var ruta = req.file.path.substr(6, req.file.path.length);
      console.log(ruta);
      var img = {
        idhome: id,
        name : req.file.originalname,
        physicalpath: req.file.path,
        relativepath: "http://localhost:7777" + ruta
      };
      var imgData = new Img(img);
      imgData.save().then( (infoimg) => {
        //content-type
        //Update User IMG
        var home = {
          gallery: new Array()
        }
        Home.findOne({_id:id}).exec( (err, docs) =>{
          //console.log(docs);
          var data = docs.gallery;
          var aux = new  Array();
          if (data.length == 1 && data[0] == "") {
            home.gallery.push("/api/v1.0/homeimg/" + infoimg._id)
          } else {
            aux.push("/api/v1.0/homeimg/" + infoimg._id);
            data = data.concat(aux);
            home.gallery = data;
          }
          Home.findOneAndUpdate({_id : id}, home, (err, params) => {
              if (err) {
                res.status(500).json({
                  "msn" : "error en la actualizacion del usuario"
                });
                return;
              }
              res.status(200).json(
                req.file
              );
              return;
          });
        });
      });
    }
  });
});

router.get(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Img.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    //regresamos la imagen deseada
    var img = fs.readFileSync("./" + docs.physicalpath);
    //var img = fs.readFileSync("./public/avatars/img.jpg");
    res.contentType('image/jpeg');
    res.status(200).send(img);
  });
});
router.post("/home", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var home = {
    street : req.body.street,
    descripcion : req.body.descripcion,
    price : req.body.price,
    lat : req.body.lat,
    lon : req.body.lon,
    neighborhood : req.body.neighborhood,
    city : req.body.city,
    gallery: "",
    contact: req.body.contact
  };
  var homeData = new Home(home);

  homeData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "usuario Registrado con exito "
    });
  });
});

// READ all users
router.get("/home", (req, res, next) => {
  var params = req.query;
  console.log(params);
  var price = params.price;
  var over = params.over;

  if (price == undefined && over == undefined) {
    // filtra los datos que tengan en sus atributos lat y lon null;
    Home.find({lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  }
  if (over == "equals") {
    console.log("--------->>>>>>>")
    Home.find({price:price, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  } else if ( over == "true") {
    Home.find({price: {$gt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  } else if (over == "false") {
    Home.find({price: {$lt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  }
});
// Read only one user
router.get(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});

router.delete(/home\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
router.patch(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var home = {};
  for (var i = 0; i < keys.length; i++) {
    home[keys[i]] = req.body[keys[i]];
  }
  console.log(home);
  Home.findOneAndUpdate({_id: id}, home, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
router.put(/home\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'altura', 'peso', 'edad', 'sexo', 'email'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {
    name : req.body.name,
    altura : req.body.altura,
    peso : req.body.peso,
    edad : req.body.edad,
    sexo : req.body.sexo,
    email : req.body.email
  };
  Home.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});


*/




//CONTROL DE LOGIN PARA CLIENTES

router.post("/login", (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var result = CLIENT.findOne({email: email,password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({name: doc.email, password: doc.password}, "seponeunallavesecreta", (err, token) => {
          console.log(err);
          res.status(200).json({
            token : token
          });
      })
    } else {
      res.status(200).json({
        msn : "El usuario no existe ne la base de datos"
      });
    }
  });
});





////////////////////////////////////////////////////////////// API CLIENTE

router.post("/client", (req, res) => {
  var client = req.body;
  //Validacion de datosssss
  //Validar ojo


console.log(client);
var name_reg = /\w{3,}/g
var email_reg =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/g
var phone_reg = /\w[0-9]/g
var ci_reg = /\w[0-9]/g
var password_reg = /\w{5,}/g


if(client.name.match(name_reg) == null){
  res.status(300).json({
    msn: "formato de nombre no valido, use solo letras"
  });
  return;
}


if(client.email.match(email_reg) == null){
  res.status(300).json({
    msn: "formato de email no valido"
  });
  return;
}

if(client.phone.match(phone_reg)==null){
  res.status(300).json({
    msn: "formato de telefono no valido,"
  });
  return;
}


if(client.ci.match(ci_reg)==null){
  res.status(300).json({
    msn: "formato de ci no valido, "
  });
  return;
}

if(client.password.match(password_reg)==null){
  res.status(300).json({
    msn: "formato de password no valido,"
  });
  return;
}

  client["registerdate"] = new Date();
  var cli = new CLIENT(client);
  cli.save().then((docs) => {
    res.status(200).json(docs);
  });
});


//GET CLIENTE

router.get("/client",verifytoken ,(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  CLIENT.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});


// PATCH CLIENTE


router.patch("/client",verifytoken ,(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["name", "email", "phone", "ci", "password"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  CLIENT.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: "cliente actualizado con el id: " + id
    })
  });
});


//DELETE CLIENTE

router.delete("/client",verifytoken ,(req, res) => {
  
  var id = req.query.id;
  CLIENT.find({_id : id}).remove().exec( (err, docs) => {
    res.status(200).json(docs);
    
      });
  });







///////////////////////////////////////////////77//API RESTAURANTE


router.post("/restaurant", verifytoken,(req, res) => {
  var restaurant = req.body;
  
///validaciones para restaurant



console.log(restaurant);

var name_reg = /\w[a-z]{3,}/g
var nit_reg = /\w[0-9]/g

var property_reg = /\w[a-z]{3,}/g
var street_reg = /\w{3,}/g
var phone_reg = /\w[0-9]/g


if(restaurant.name.match(name_reg) == null){
  res.status(300).json({
    msn: "formato de nombre del restaurant no es valido, use solo letras"
  });
  return;
}


if(restaurant.nit.match(nit_reg)==null){
  res.status(300).json({
    msn: "formato de telefono no valido,"
  });
  return;
}
if(restaurant.property.match(property_reg) == null){
  res.status(300).json({
    msn: "formato de nombre del propietario no es valido, use solo letras"
  });
  return;
}

if(restaurant.street.match(street_reg) == null){
  res.status(300).json({
    msn: "formato de calle no es valido, use solo letras"
  });
  return;
}

if(restaurant.phone.match(phone_reg)==null){
  res.status(300).json({
    msn: "formato de telefono no valido,"
  });
  return;
}








  restaurant["registerdate"] = new Date();
  var newrestaurant = new RESTAURANT(restaurant);
  newrestaurant.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "Restaurante Agregado con exito"
    });
  });
});















//
router.get("/restaurant",verifytoken ,(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  RESTAURANT.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});


//DELETE

router.delete("/restaurant",verifytoken ,(req, res) => {
  
  var id = req.query.id;
  RESTAURANT.find({_id : id}).remove().exec( (err, docs) => {
    res.status(200).json(docs);
    
      });
  });


//PATCH

router.patch("/restaurant",verifytoken ,(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["name", "nit", "property", "street", "phone", "Lat", "Lon", "logo", "picture"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  RESTAURANT.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: "restaurant actualizado con el id: " + id
    })
  });
});


router.post("/uploadrestaurant",verifytoken ,(req, res) => {
  var params = req.query;
  var id = params.id;
  var SUPERES = res;
  RESTAURANT.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(501).json({
        "msn" : "Problemas con la base de datos"
      });
      return;
    }
    if (docs != undefined) {
      upload(req, res, (err) => {
        if (err) {
          res.status(500).json({
            "msn" : "Error al subir la imagen"
          });
          return;
        }
        var url = req.file.path.replace(/public/g, "");

        RESTAURANT.update({_id: id}, {$set:{picture:url}}, (err, docs) => {
          if (err) {
            res.status(200).json({
              "msn" : err
            });
            return;
          }
          res.status(200).json(docs);
        });
      });
    }
  });
});




  

  //////////////////////////////////API MENUS
  

// CREAR MENUS

router.post("/menus", verifytoken,(req, res) => {
  var menus = req.body;


//validaciones para menus

console.log(menus);

var name_reg = /\w[a-z]{3,}/g
var price_reg = /\w[0-9]/g
var description_reg = /\w[a-z]{3,}/g 
var idrestaurant_reg = /\w[0-9]/g


if(menus.name.match(name_reg) == null){
  res.status(300).json({
    msn: "formato de nombre del MENU no es valido, use solo letras"
  });
  return;
}


if(menus.price.match(price_reg)==null){
  res.status(300).json({
    msn: "formato de PRECIO DEL MENU  no es valido,"
  });
  return;
}
if(menus.description.match(description_reg) == null){
  res.status(300).json({
    msn: "formato de DESCRIPCION DEL MENU no es valido, use solo letras"
  });
  return;
}

if(menus.idrestaurant.match(idrestaurant_reg) == null){
  res.status(300).json({
    msn: "formato de IDE DEL RESTAURANT no es valido"
  });
  return;
}

  menus["registerdate"] = new Date();
  var newmenu = new MENUS(menus);
  newmenu.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "menu Agregado con exito"
    });
  });
});

// leer menus
router.get("/menus",verifytoken ,(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  MENUS.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});

//PATCH MENUS


router.patch("/menus",verifytoken ,(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["name", "price", "description", "picture"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  MENUS.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: "menu actualizado con el id siguienteeee: " + id
    })
  });
});


//DELETE PARA MENUS

router.delete("/menus",verifytoken ,(req, res) => {
  
  var id = req.query.id;
  MENUS.find({_id : id}).remove().exec( (err, docs) => {
    res.status(200).json(docs);
    
      });
  });


// subir imagenes de menus
router.post("/uploadmenus",verifytoken ,(req, res) => {
  var params = req.query;
  var id = params.id;
  var SUPERES = res;
  MENUS.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(501).json({
        "msn" : "Problemas con la base de datos"
      });
      return;
    }
    if (docs != undefined) {
      upload(req, res, (err) => {
        if (err) {
          res.status(500).json({
            "msn" : "Error al subir la imagen"
          });
          return;
        }
        var url = req.file.path.replace(/public/g, "");

        MENUS.update({_id: id}, {$set:{picture:url}}, (err, docs) => {
          if (err) {
            res.status(200).json({
              "msn" : err
            });
            return;
          }
          res.status(200).json(docs);
        });
      });
    }
  });
});



//////////////////////////////////////////////////////////////////////////////////API ORDENES

router.post("/orders", verifytoken,(req, res) => {
  var orders = req.body;
  

  ////Validacion para ordenes
  

console.log(orders);

var idmenu_reg = /\w[0-9]/g
var idcliente_reg = /\w[0-9]/g
var street_reg = /\w[a-z]{3,}/g 
var pagototal_reg = /\w[0-9]/g


if(orders.idmenu.match(idmenu_reg) == null){
  res.status(300).json({
    msn: "formato de del IDE MENU no es valido, use solo numeros"
  });
  return;
}


if(orders.idcliente.match(idcliente_reg)==null){
  res.status(300).json({
    msn: "formato de ID del CLIENTE  no es valido, use solo numeros"
  });
  return;
}
if(orders.street.match(street_reg) == null){
  res.status(300).json({
    msn: "formato de DESCRIPCION DEL MENU no es valido, use solo letras"
  });
  return;
}

if(orders.pagototal.match(pagototal_reg) == null){
  res.status(300).json({
    msn: "formato  no es valido, use solo numeros"
  });
  return;
}




  orders["registerdate"] = new Date();
  var neworders = new ORDERS(orders);
  neworders.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "orden REGISTRADA con exito"
    });
  });
});


router.get("/ordes",verifytoken ,(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  ORDERS.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});



//PATCH

router.patch("/orders",verifytoken ,(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["idmenu", "idcliente", "street", "Lat", "Log", "pagototal"];
  var newkeys = [];
  var values = [];

  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  ORDERS.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: "ORDEN actualizado con el id: " + id
    })
  });
});


router.delete("/orders",verifytoken ,(req, res) => {
  
  var id = req.query.id;
  ORDERS.find({_id : id}).remove().exec( (err, docs) => {
    res.status(200).json(docs);
    
      });
  });




module.exports = router;
