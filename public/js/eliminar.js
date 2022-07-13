window.onload=function(){
    let botones=document.querySelectorAll("button");
    for (let i=0;i<botones.length;i++){
        botones[i].addEventListener("click",function(e){
            console.log(e.target.parentElement.parentElement.querySelector("Id").innerText);
            let id=e.target.parentElement.parentElement.querySelector("td").innerText;
            eliminar(id);
        })
    }
};

//function para llamar al metodo delete del servidor
async function eliminar(id){
    let respuesta=await fetch("http://localhost:3000/prestamos/"+id,{
        method:"DELETE"
    });
    if(respúesta.status<300){
        let datos=respuesta.json();
        //alert("objeto elimnado")
        const fila=document.querySelectorA("#d"+id);
        fila.remove();
    }else{
        let datos= await respuesta.json();
        alert("Error al elimanr datos");
    }
}