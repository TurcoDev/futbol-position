import  bodyParser from 'body-parser';
import express from 'express';
import { engine } from 'express-handlebars';
import * as path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { load } from "cheerio";
import posFutbolModel from './models/futbolTeamModel.js';


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
  deleteAll();
  // Insert positions in database
  // insert(positionsDB);
};

// invoking the main function
getFutbolList();
// invoking the main function with time interval
const time = 900000;
setInterval(getFutbolList, time);

// Send information to view
app.get('/', async (req, res) => {
  // const positions = await positionModel.find(); // tipo de dato incompatible VER!!
  res.render('home', {titulo: '<h1>Inicio con HBS</h1>',
  items: positionsDB});
});

/**************************************************** 
// Querys Data Base
*****************************************************/ 
// Get elements
const getElements = async () => {
  const positions = await posFutbolModel.find();// '', "pos	equipo	pj	g	e	p	gf	gc	dg	pts"
  console.log(positions);
  return positions;
}

// Insert test
const insertTest = async () => {
  const equipo = new posFutbolModel({
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

// insert one element
const insertElement = async (element) => {
    const equipo = new posFutbolModel(element);
    const result = await equipo.save();
}

// insert many elements
const insert = async (equipos) => {
    const result = await posFutbolModel.insertMany(equipos);
}

// update element mach id
const updateById = async (id) => {
  const equipo = await posFutbolModel.updateOne({_id:id},
    {
      $set:{
        pos: '20 modificado',
        p: 'modificado'
      }
    });
  console.log(equipo);
}

// delete mach id
const delOne = async (id) => {
  const equipo = await posFutbolModel.deleteOne({_id:id});
  console.log(equipo);
}

// delete all
const deleteAll = async () => {
  const equipo = await posFutbolModel.deleteMany({});
  // console.log(equipo);
}

// Update by position
const updateByPos = async (pos) => {
  const equipo = await posFutbolModel.updateMany({pos: pos},
    {
      $set:{
        equipo: 'YOYO modificado',
        p: 'modificado'
      }
    });
  console.log(equipo);
}