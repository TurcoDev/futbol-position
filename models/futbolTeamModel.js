import mongoose from "../db/database.js";
 
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
  
// create an model and export
export default mongoose.model("positions", tablePositionSchema);