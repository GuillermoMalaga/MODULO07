
//1.- Cargar modulos o librerias
const {Pool}=require("pg");
require('dotenv').config();

//2.-crear la configuarcuion
const port = 3000

const configuracion={
    host:process.env.PGHOST,
    port:process.env.PGPORT,
    database:process.env.PGDATABASE,
    user:process.env.PGUSER,
    password:process.env.PGPASSWORD,
    }
    //3.- crear la conexion pool
    const pool=new Pool(configuracion);

//4.-Decalrar las consultas
const consulta1='INSERT INTO "Autores" VALUES (22,\'Frank Herbert\',\'1920-10-19\',\'EEUU\')';
const consulta2='INSERT INTO "Libros" VALUES (34,\'Dune\',400,1965,22,5,1,1)';

//5.- ejecutar consultas
async function ejecutar(){
    try{
        await pool.query("BEGIN"); 
        await pool.query(consulta1);
        console.log("Autor insertado exitosamente");
        await pool.query(consulta2);
        console.log("Libro insertadfo exitosamente");
        await pool.query("COMMIT")
    }catch(error){
        await pool.query("ROLLBACK");
        console.log("Erroe al ejecutar consultas");
        console.log("Error :"+error.message)
    }
};
//ejecutar();
/*ejercicois
1.- crear un formulario donde se ingrese:
nombre del libro
Año de edicion
Nombre del autor
numero de pagina
fecha de nacimiento autor
nacionalidad del autor
--para el genenro e idioma usar 1
--para el id consultar por el max id de la tabla correspondioente
--usar post para el formulario
SELECT coalesce(MAX("Id"),0)+1 FROM "Libros"
*/
const express= require("express");
const app = express();
var bodyParser=require('body-parser');
//const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:false}));
app.get('/',(req,res)=>res.send("Hola mundo"));
//app.listen(port,()=> console.log("ejemplo de app escuchandop en pouerto 3000"));

app.post("/transaccion/insert",async function(req,res){
    //res.send("OK");
    //query para buscar los id
    const queryIDAutor='SELECT COALESCE(MAX("Id"),0)+1 AS "Id" FROM "Autores"'
    const queryIDLibro='SELECT COALESCE(MAX("Id"),0)+1 AS "Id" FROM "Libros"'
    //ejecucion querys
    const respuestaIdAutor=await pool.query(queryIDAutor);
    const respuestaIdLibro=await pool.query(queryIDLibro);
    //verificacion de datos
    console.log(respuestaIdAutor.rows[0].Id);
    console.log(respuestaIdLibro.rows[0].Id);
    console.log(req.body);
    //query para insertar datos
    const query1='INSERT INTO "Autores" VALUES ($1,$2,$3,$4)'
    const query2='INSERT INTO "Libros" VALUES ($1,$2,$3,$4,$5,1,1,1)'
    //ejecucion insert
    try {
        await pool.query("BEGIN")
        await pool.query(query1,[respuestaIdAutor.rows[0].Id,req.body.autor,req.body.nacionalidad])
        await pool.query(query2,[respuestaIdLibro.rows[0].Id,req.body.libro,req.body.paginas,req.body.edicion,respuestaIdAutor.rows[0].Id])
        await pool.query("COMMIT")
        res.send("Datos ingresados correctamente");
    } catch (error) {
        await pool.query("ROLLBACK");
        console.log("Error al ejecutar consultas");
        console.log("Error:"  + error.message);
        res.send("error al ingresar los datos");
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
