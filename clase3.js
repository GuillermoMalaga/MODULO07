//importar librerias o módulos---------------------------------------------
const {Client,Pool}=require('pg');
const express = require('express');
const url=require('url');
require('dotenv').config();

//crear configuracion------------------------------------------------------
const port = 3000

const configuracion={
    host:process.env.PGHOST,
    port:process.env.PGPORT,
    database:process.env.PGDATABASE,
    user:process.env.PGUSER,
    password:process.env.PGPASSWORD,
    max:20, //conexiones maximas del pool
    idleTimeoutMillis: 3000, //tiempo de espera
    connectionTimeoutMillis: 2000, //tiempo de desconexion
}

//inicializacion-----------------------------------------------------------
const pool=new Pool(configuracion);
const app = express()

//rutas--------------------------------------------------------------------
//obtener la lista de libros desde la bd
app.get('/libros', async (req, res) => {
    const consulta='SELECT l."Nombre" AS "Libro",a."Nombre" AS "Autor", l."Edicion" FROM "Libros" l JOIN "Autores" a ON l."IdAutor"=a."Id" '
    let resultado;
    try{
        resultado= await pool.query(consulta);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
        res.status(500);
        res.end('error al buscar datos');
    }
});
//ejecucion del server----------------------------------------------------
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)    
})

//ejercicios:
//1.- crear rutas para devolver: autores
//2.- cantidad de libros por genero (lista)
//3.- datos de u libro en específico (a traves de la id)<--recibir codigo en la url, a traves de los params o query
//4.- cantidad de copias por libro
//5.- generar un nuevo prestamo (tabajar con postman)<---recibir un json por el body

//ejecrcicio 1
app.get('/autores', async (req, res) => {
    const consulta='SELECT "Nombre","FechaNacimiento","Nacionalidad"  FROM "Autores" '
    let resultado;
    try{
        resultado= await pool.query(consulta);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
        res.status(500);
        res.end('error al buscar datos');
    }
});
//ejecrcicio 2
app.get('/libros_generos', async (req, res) => {
    const consulta='SELECT g."Nombre", COUNT(l."Id") FROM "Genero" g     LEFT JOIN "Libros" l ON l."IdGenero"=g."Id" GROUP BY g."Nombre" '
    let resultado;
    try{
        resultado= await pool.query(consulta);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
        res.status(500);
        res.end('error al buscar datos');
    }
});
//ejercicio 3 (alexis)
app.get('/libro', async (req, res) => {            
    try{
        let libro= `SELECT * FROM "Libros" WHERE "Id"=${req.query.id}`;
        const resultado= await pool.query(libro);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);
        res.status(500);
        res.end('Error al buscar datos');
    }
})
//ejercicio 3 alternativo
app.get("/libros/:id",async function (req,res){
    let query= `SELECT * FROM "Libros" WHERE "Id"=$1`;
    try{
        const resultado= await pool.query(query,[req.params.id]);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);
        res.status(500);
        res.end('Error al buscar datos');
    }
})
//ejecrcicio 4
app.get('/copias_libro', async (req, res) => {
    let consulta='SELECT l."Nombre",COUNT(c."IdLibro") AS "Cantidad" FROM "Libros" l '
    consulta +=' JOIN "Copia" c ON c."IdLibro"=l."Id" GROUP BY l."Nombre" ORDER BY "Cantidad" DESC'
    let resultado;
    try{
        resultado= await pool.query(consulta);
        let response={respuesta:resultado.rows};
        res.send(JSON.stringify(response));
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
        res.status(500);
        res.end('error al buscar datos');
    }
});

//ejercicio 6: crear una respuesta con texto html para el ejercicio 1(autores)
//ejercicio 7: crear un archivo html que se modifique con los datos de una lista de libros

//ejemplo con editoriales de generacin html
app.get("/editorial",async function(req,res){
let consulta ='SELECT "Nombre","Pais" FROM "Editorial"';
try{
    //1.- leer desde la bd
    let resultado=await pool.query(consulta);
    //2.- con los datos, generar el html
    let html="<ul>";
    for(i=0;i<resultado.rows.length;i++){
        html+="<li>" + resultado.rows[i].Nombre + " - "+  resultado.rows[i].Pais + "</li>"
    }
    html+="</ul>"
    res.send(html);

}catch(err){
    console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
    res.status(500);
    res.end('error al buscar datos');
}
})

//ejercicio 7
const fs=require('fs');

app.get("/bootstrap/libros",async function(req,res){
    try{
        let consulta ='SELECT l."Nombre" AS "Libro",a."Nombre" AS "Autor", l."Edicion" FROM "Libros" l JOIN "Autores" a ON l."IdAutor"=a."Id" ';
        //1.- leer desde la bd
        let resultado=await pool.query(consulta);
        //2.- cargar el archivo html
        let html = fs.readFileSync('html/ejercicio7.html').toString();
        //3.- generar el contenido del la grilla html        
        let contenido="";
        for(i=0;i<resultado.rows.length;i++){
            contenido+= '<div class="row">'
            contenido+='<div class="col">' + resultado.rows[i].Libro + '</div>'
            contenido+='<div class="col">' + resultado.rows[i].Autor + '</div>'
            contenido+='<div class="col">' + resultado.rows[i].Edicion + '</div>'
            contenido+= '</div>'
        }
        //4.- insertar el contenido en el html
        html=html.replace("__datos__",contenido);
        //5.- enviar el html
        res.send(html);    
    }catch(err){
        console.log(`Error al ejecutar consulta: ${err.message}`);//"Error al ejecutar consulta:" +err.message
        res.status(500);
        res.end('error al buscar datos');
    }
})

//ejercicio 8: crear un archivo html, con un formulario de pedido de un libro (prestamo, ejercicio 5)
app.get("/Prestamos",async function(req,res){
    let consulta='SELECT p."Id",u."Nombre" AS "Usuario",l."Nombre" AS "Libro", "FechaPrestamo", "FechaDevolucion"	FROM "Prestamo" p';
    consulta+= ' JOIN "Usuario" u ON p."RutUsuario"=u."Rut" ';
    consulta+=' JOIN "Libros" l ON p."idLibro"=l."Id" ORDER BY "FechaPrestamo"';
    try{
        //ejectutar la consulta
        const resultado = await pool.query(consulta);
        //4.- leer el archivo html y modificado
        let html=fs.readFileSync("html/ejercicio8.html").toString();
        //5.- generar el contenido de la tabla html
        let contenido='';
        for(let i=0;i<resultado.rows.length;i++){
            contenido+='<tr id="d>'+resultado.rows[i].Id+'">';
            contenido+="<td>"+resultado.rows[i].Id+"</td>";
            contenido+="<td>"+resultado.rows[i].Usuario+"</td>";
            contenido+="<td>"+resultado.rows[i].Libro+"</td>";
            contenido+="<td>"+resultado.rows[i].FechaPrestamo+"</td>";
            contenido+="<td>"+resultado.rows[i].FechaDevolucion+"</td>";
            contenido+="<td><button>Elimniar</button></td>";
            contenido+="</tr>";
        }
        html=html.replace("--contenido--",contenido);
        res.send(html);
    }catch(error){
        console.log("error en la consulta");
        console.log("Error"+error.message);
        res.status(500);
        res.send("Error al acargar los datos");
    }
})
//funcion para eliminar
app.delete("/prestamos/:id",async function(req,res){
    const consulta='DELETE FROM "Prestamo" WHERE "Id"=$1';
    try{
        await pool.query(consulta,[req.params.id]);
        res.json({status:"OK"});
    }catch(error){
        console.log("error en la consulta");
        console.log("Error:"+error.message);
        res.status(500);
        res.json({memsaje:"Error al eliminar"});
    }
})