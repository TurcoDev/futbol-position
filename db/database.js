import mongoose from 'mongoose';

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

export default mongoose;
