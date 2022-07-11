const {Client, Pool}=require('pg');
require('dotenv').config();
//crear configuracion
const configuracion={
    host:process.env.PGHOST,
    port:process.env.PGPORT,
    database:process.env.PGDATABASE,
    user:process.env.PGUSER,
    password:process.env.PGPASSWORD,
    max:20,//numero de conexiones
    min:2,
    idleTimeoutMillis:30000,//tiempo de espera
    connectionTimeoutMillis:2000//tiempo de desconecion
}
//inicializacion
const pool=new Pool(configuracion);

//consulta de prueba
const sql='SELECT * FROM "Libros"';
//1.-consulta de prueba  con callback
pool.query(sql,function(err,res){
    if(err){
        console.log("Eror"+err.message);
    }else{
        console.log(res.rowCount);
    }
})

//2.-consulta sin callback

async function ejecutarConsulta(){
    let respuesta=await pool.query('SELECT * FROM "Libros"');
    console.log("---------------------------------------------------------------");
    console.log(respuesta.rowCount);
    console.log("---------------------------------------------------------------");
}
ejecutarConsulta();

//3.- consulta con PARAMETROS
pool.query('SELECT * FROM "Libros" WHERE "Paginas">$1',[500],function(err,res){
    if(err){
        console.log("Erroe"+err.message);
    }else{
        console.log("Count 3 :"+res.rowCount);
        console.log("------------------------------------");
    }
})
//4.- FUNCION ASINCRONA CON PARAMETROS
const query4='SELECT * FROM "Libros" WHERE  "Paginas">$1 AND "Edicion">$2';
const parametros=[500,2000];
async function ejecutarConsulta4(){
    let respuesta = await pool.query(query4,parametros);
    console.log("count 4 :"+respuesta.rowCount);
    console.log("-------------------------------------------------");
}
ejecutarConsulta4();
//5.-query con objeto
const query5={
    text:'SELECT * FROM "Libros" WHERE  "Paginas">$1 AND "Edicion">$2',
    values:[500,2000]
}

pool.query(query5,function(err,res){
    if(err){
        console.log("Erroe"+err.message);
    }else{
        console.log("Count 5 :"+res.rowCount);
        console.log("------------------------------------");
    }
})

//ejercicios
//1.-agregar un nuevo autor y dos libros de su autopria
//2.-obtener una lista donde se indiquen la cantidad de libros por genero