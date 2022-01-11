import mongoose from 'mongoose';
import  bodyParser from 'body-parser';
import express from 'express';
import { engine } from 'express-handlebars';
import * as path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { load } from "cheerio";


/**************************************************** 
// Server connection
*****************************************************/ 

// Server express connect
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

// parser JSON
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

// Path public folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/static', express.static(__dirname + '/public'));

// Include handlebars view engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));


/**************************************************** 
// Scrapping position futbol page and insert DB data
*****************************************************/ 

// URL for data
const URL =
  "https://www.futbolargentino.com/primera-division/tabla-de-posiciones";

// function to get the raw data
const getRawData = (URL) => {
  return fetch(URL)
  .then((response) => response.text())
  .then((data) => {
    return data;
  });
};

// Save all table data
var positionsDB = [];

// start of the program
const getFutbolList = async () => {
  const futbolRankingRawData = await getRawData(URL);

  // parsing the data
  const parsedFutbolRankingData = load(futbolRankingRawData);

  // extracting the table data
  //get rows table <tr>
  const futbolDataTable =
    parsedFutbolRankingData("table.table")[0].children[1].children;

    const parsedImg = parsedFutbolRankingData("td.equipo");
    // console.log(parsedImg.html());
    const imgTag = parsedImg.find("a.no-padding img").attr('data-src');
    // console.log(imgTag);
    const spanTag = parsedImg.find("a.no-padding span.d-none");
    // console.log(spanTag.html());

    // console.log("Pos	Equipo	PJ	G	E	P	GF	GC	DG	Pts");

    futbolDataTable.forEach((row) => {
      // extracting `td` tags
      if (row.name === "tr") {
      // get td of tr        
      const columns = row.children.filter((column) => column.name === "td");

      let column6 = columns[6].children[0].data;
      column6 = column6.trim();

      let column7 = columns[7].children[0].data;
      column7 = column7.trim();

      let column8 = columns[8].children[0].data;
      column8 = column8.trim();

      const rowDBElement = {
        pos: columns[0].children[0].data,
        escudo: imgTag,
        equipo: spanTag.html(),
        pj: columns[2].children[0].data,
        g: columns[3].children[0].data,
        e: columns[4].children[0].data,
        p: columns[5].children[0].data,
        gf: column6,
        gc: column7,
        dg: column8,
        pts: columns[9].children[0].data,
      };

      // add position team in array
      positionsDB.push(rowDBElement);
    }
  });
  // Delete elements of positions collection
  eliminarTodos();
  // Insert positions in database
  insertarVarios(positionsDB);
};

// invoking the main function
getFutbolList();
// invoking the main function with time interval
const time = 900000;
setInterval(getFutbolList, time);

// Send information to view
app.get('/', async (req, res) => {
  // const positions = await positionModel.find(); // tipo de dato incompatible
  res.render('home', {titulo: '<h1>Inicio con HBS</h1>',
  items: positionsDB});
});

/**************************************************** 
// DB Connection (model and schema)
*****************************************************/ 

// Database connection
 const url =
 "mongodb+srv://root:dontpass@cluster0.t95xw.mongodb.net/futbol?retryWrites=true&w=majority";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

const conn = mongoose.connection;
conn.on('connected', function() {
    console.log('database is connected successfully');
});
conn.on('disconnected',function(){
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));

// create an schema
var tablePositionSchema = new mongoose.Schema({
  pos: String,
  escudo: String,
  equipo: String,
  pj: String,
  g: String,
  e: String,
  p: String,
  gf: String,
  gc: String,
  dg: String,
  pts: String,
}, {versionKey: false});

// create an model
var positionModel = mongoose.model('positions',tablePositionSchema);

/**************************************************** 
// Consultas a la base de datos
*****************************************************/ 
// Mostrar
const mostrar = async () => {
  const positions = await positionModel.find();// '', "pos	equipo	pj	g	e	p	gf	gc	dg	pts"
  // console.log(positions);
  return positions;
}

// Insertar
const insertar = async () => {
  const equipo = new positionModel({
    pos: '1',
    escudo: 'escudo1',
    equipo: 'Boca',
    pj: '5',
    g: '20',
    e: '6',
    p: '8',
    gf: '9',
    gc: '10',
    dg: '89',
    pts: '78',
  });
  const result = await equipo.save();
  console.log(result);
}

// Insertar
const insertar2 = async (element) => {
    const equipo = new positionModel(element);
    const result = await equipo.save();
}

// Insertar varios
const insertarVarios = async (equipos) => {
    const result = await positionModel.insertMany(equipos);
}

// Actualizar
const actualizar = async (id) => {
  const equipo = await positionModel.updateOne({_id:id},
    {
      $set:{
        pos: '20 modificado',
        p: 'modificado'
      }
    });
  console.log(equipo);
}

// Eliminar
const eliminar = async (id) => {
  const equipo = await positionModel.deleteOne({_id:id});
  console.log(equipo);
}

// Eliminar todos
const eliminarTodos = async () => {
  const equipo = await positionModel.deleteMany({});
  // console.log(equipo);
}

// Actualizar todos por posicion
const updateByPos = async (pos) => {
  const equipo = await positionModel.updateMany({pos: pos},
    {
      $set:{
        equipo: 'YOYO modificado',
        p: 'modificado'
      }
    });
  console.log(equipo);
}


// Llamadaa a procedimientos
// insertar();
// insertarVarios(positionsDB);
// mostrar();
// actualizar('61dc7d18a08c01f953aa149b');
// eliminar('61dc7d18a08c01f953aa149b');
// eliminarTodos();
// updateByPos('1');


