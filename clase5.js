//.-1 cargamos la libreria
const {Sequelize, DataTypes,Op} = require('sequelize');
const chalk = require("chalk");
//2.- crear una conexion sequelize
const sequelize = new Sequelize("TestingSequelize","postgres","postgres",{
    host:"localhost",
    dialect:"postgres"
});

//3.- probar que sequelize funcione y se conecte correctamente
async function conectar(){
    try{
        await sequelize.authenticate();
        console.log(chalk.green.inverse("--------------------Conexion Establesida----------------"));
    } catch(error){
        console.log(chalk,red.inverse("Error en la conexion"+error.message));
    }
    
}
//3.2.- conectar la base de datos
conectar();

//4.- crear un modelo
//**importante agregar el objeto DataTypes de la libreria sequelize, arriba en el require */
//parametros: nombre del modelo y definicion del modelo(modelo=Tabla)
const usuarioBasico=sequelize.define("UsuarioBasico",{
    //columnas
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
    apellido:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
//opciones
});//otro modelo}
const usuarioAvanzado=sequelize.define("UsuarioAvanzado",{
    rut:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    apellido:{
        type:DataTypes.STRING,
        allowNull:false,
    }
},{
    //opciones
    timestamps:false,//previene las columnas con fecha de creacion y actualizacion
    freezeTableName:true//obliga a la tabla a tener el mismo nmbre que el modelo
    //tablename:'otro nombre'    define el nombre de la tabla de la bd con otro distinto modelo
})
//5.- sincronizar la base de datos
async function sincronizar(){
    try{
    await sequelize.sync({/*opcion*/})//opcion:{force:true} para borrar la db y crearla de cero
    console.log(chalk.green.inverse("------------------sincronizacion correcta"));
    }catch(error){
        console.log("Errroe al sincronizar"+ error.message)
    }
}
sincronizar();
//---------------------------------------------------------------------------
//6.- crear objeto o instancias d elos modelos

async function guradarUsuario1(){
    try{
        let usuario1= usuarioBasico.build({
            nombre:"Denis",
            apellido:"Pacheco"
        });
        await usuario1.save();
        console.log(chalk.green.inverse("Datos guardados correctamente"));
    }catch(error){
        console.log(chalk.red.inverse("Error al sincronizar:  "+error.message));
    }
}
//guradarUsuario1();
//6.2 crear y guardar ak mismo tiempo atravez de crearte
async function guradarUsuario2(){
    try{
        let usuario1= await usuarioBasico.create({//crate hace lo de build y save al misnmo tiempo
            nombre:"Alejandra",
            apellido:"Ruiz"
        });
        //await usuario1.save();
        console.log(chalk.green.inverse("Datos guardados correctamente"));
    }catch(error){
        console.log(chalk.red.inverse("Error al sincronizar:  "+error.message));
    }
}
//guradarUsuario2();
//6.3 funcion de creacion generica

async function guardarUsuario(nombre,apellido){
    try{
        let usuario= await usuarioBasico.create({//crate hace lo de build y save al misnmo tiempo
            nombre:nombre,
            apellido:apellido
        });
        //await usuario1.save();
        console.log(chalk.green.inverse("Datos guardados correctamente"));
    }catch(error){
        console.log(chalk.red.inverse("Error al sincronizar:  "+error.message));
    }
}
//guardarUsuario("bruno","fuenzalida");
//guardarUsuario("clemente","arriegada");
//guardarUsuario("sandra","valenzuela");
//7.1SELECT 
async function buscarTodos(){
    try {
        const datos=await usuarioBasico.findAll();
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Erroe al sincronizar"+error.message));
    }
}
//buscarTodos();
//7.2.- SELECT CAMPOS ESPECIFICOS // select nombre,apellido form UsuariosBasicos
async function buscarColumnas(){
    try {
        const datos=await usuarioBasico.findAll({attributes:['nombre',
        ['apellido','APELLIDO']//nombre de la columna y su alias
    ]});
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Erroe al sincronizar"+error.message));
    }
}
//buscarColumnas();
//7.3 select con condicion//
async function buscarCondicion(){
    try {
        const datos=await usuarioBasico.findAll({
            where:{
                "id":1
            }
        });
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Erroe al sincronizar"+error.message));
    }
}
//buscarCondicion();
//7.4 select con operaciones/
async function buscarOperaciones(){
    try {
        const datos=await usuarioBasico.findAll({
            where:{
                [Op.or]:[
                    {nombre:"Denis"},
                    {nombre:"Alejandra"}
                ]
            }
        });
        console.log("*******************OPERACIONES******************")
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Erroe al sincronizar"+error.message));
    }
}
//buscarOperaciones();
//---------------------------------------------------------------------------------------------------------//
//8.-UPDATES(ACTUALIZACIONES)
//UPDATE "UsuariosBasicos" SET nombre='maximiliano' WHERE nombre='denis'
async function actualizar(){
    try {
        const datos=await usuarioBasico.update({nombre:"Maximiliano "},
            {
            where:{
                nombre:"Denis"
            }
        });
        console.log("**********UPDATE*****************");
    } catch (error) {
        console.log(chalk.red.inverse("ErroR AL ACTUALIZAR"+error.message));
    }
}
//actualizar();
//9.- DELETE
async function eliminar(){
    try {
        const datos=await usuarioBasico.destroy({
           where:{
                id:3
           }
        });        
        console.log(chalk.green.inverse("***DELETE***"));
    } catch (error) {
        console.log(chalk.red.inverse("Error al eliminar: "  + error.message));
    }
}
eliminar();

//--------------------------------------------------------------------
//FUNCIONES AVANZADAS
//10.-bulkCreate, ingresa usuarios por lote, los cuales deben estar en un arreglo
async function crearLotes(){
    try {
        const datos=await usuarioBasico.bulkCreate([
            {nombre:"alejandra",apellido:"ruiz"},
            {nombre:"alexis",apellido:"menco"},            
            {nombre:"Guillermo",apellido:"NN"}
        ]);        
        console.log(chalk.green.inverse("***BULK CREATE***"));
    } catch (error) {
        console.log(chalk.red.inverse("Error al crearLotes: "  + error.message));
    }
}
//crearLotes();

//11.-ORDENAR (ORDER BY))
async function buscarOrdenado(){
    try {
        const datos=await usuarioBasico.findAll({
          order:[
            ['id','DESC']
          ]
        });        
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Error al buscarOrdenado: "  + error.message));
    }
}
buscarOrdenado();

//12.- agrupar
async function buscarAgrupado(){
    try {
        const datos=await usuarioBasico.count({
          attributes:['nombre'],
          group:'nombre'
        });        
        console.log(JSON.stringify(datos,null,2));
    } catch (error) {
        console.log(chalk.red.inverse("Error al buscarOrdenado: "  + error.message));
    }
}
buscarAgrupado();