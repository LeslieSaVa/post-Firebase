// Initialize Firebase
var config = {
  apiKey: "AIzaSyCa4DdugY8BDduKRJPCwfMpA2Tmv2qO7Zg",
  authDomain: "comentarios-717e9.firebaseapp.com",
  databaseURL: "https://comentarios-717e9.firebaseio.com",
  projectId: "comentarios-717e9",
  storageBucket: "comentarios-717e9.appspot.com",
  messagingSenderId: "629690031849"
};
firebase.initializeApp(config);

window.onload = inicializar;

var formInformation;
var refComentarios;
var newcoments;
var CREATE = "Crear Comentario";
var UPDATE = "Guardar Cambios";
var modo = CREATE;
var refEditComents;

var fichero;
var storageRef;
var imagenesRef;

function inicializar(){

    //subir una imagen a FIREBASE
    fichero = document.getElementById("fichero");
    fichero.addEventListener("change", uploadImgtoFirebase, false);

    storageRef = firebase.storage().ref();

    imagenesRef = firebase.database().ref().child("imagenes");

    //
    formInformation = document.getElementById("form-information");
    formInformation.addEventListener("submit", enviarConvalidacionAFirebase, false);
    
    newcoments = document.getElementById("newcoments");
    
    //referencia al hijo del nodo raiz de la base de datos que estoi trabajando
   refComentarios =  firebase.database().ref().child("coments(i)");

   mostrarComentarios();
   mostrarImgFirebase();
}
//funciones para las imagenes

function mostrarImgFirebase(){
    imagenesRef.on("value", function(snapshot){
        var datos = snapshot.val();
        var result = "";
        for (var key in datos){
            result += '<img class="img" src="' + datos[key].url + '"/>';
        }
        document.getElementById("imagenes-de-FB").innerHTML = result;
    });
}

function uploadImgtoFirebase(){
    var imagenASubir = fichero.files[0];

    var uploadTask = storageRef.child('imagenes/' + imagenASubir.name).put(imagenASubir);
    uploadTask.on('state_changed', 
    function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, function(error) {
        alert("hubo un error");
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        crearNodoEnBDFirebase(imagenASubir.name, downloadURL);
      });
    });
}

function crearNodoEnBDFirebase(nombreImagen, downloadURL){
    imagenesRef.push({nombre: nombreImagen, url: downloadURL});
}



//funciones de los cometarios 
function mostrarComentarios(){
    refComentarios.on("value", function(snap){
        var datos = snap.val();
        //var newcoments = document.getElementById("newcoments");
        var filasAmostrar = "";
        for(var key in datos){
            filasAmostrar += "<p>" + datos[key].comentario + "<p>" 
            + '<button class="btn delete" data-convalidacion="'+ key + '">' + '<i class="material-icons">delete</i>' + 
            "</button>"   
            + '<button class="btn edit" data-convalidacion="'+ key + '">' + '<i class="material-icons">edit</i>' + 
            "</button>"     
        }
        newcoments.innerHTML = filasAmostrar;
        if(filasAmostrar != ""){
            var editElements = document.getElementsByClassName("edit");
            for(var i =0; i < editElements.length; i++){
                editElements[i].addEventListener("click", editComentsFromFirebase, false);
            }
            var deleteElements = document.getElementsByClassName("delete");
            for(var i =0; i < deleteElements.length; i++){
                deleteElements[i].addEventListener("click", deleteComentsFromFirebase, false);
            }
        }
    });
}

function editComentsFromFirebase(){
    var keyOfEditComents = this.getAttribute("data-convalidacion");
    refEditComents = refComentarios.child(keyOfEditComents);
    refEditComents.once("value", function(snap){
        var datos = snap.val();
        document.getElementById("coments").value = datos.comentario;
    });
    document.getElementById("btn-coments").value = UPDATE;
    modo = UPDATE;
}

function deleteComentsFromFirebase(){
    var keyOfDeleteComents = this.getAttribute("data-convalidacion");
    var refDeleteComents = refComentarios.child(keyOfDeleteComents);
    refDeleteComents.remove();
}

function enviarConvalidacionAFirebase(event){
    event.preventDefault();
    switch(modo){
        case CREATE:
            refComentarios.push({
                nombre: event.target.nombre.value,
                titulo: event.target.titulo.value,
                comentario:event.target.comentario.value
        });
            break;
        case UPDATE:
            refEditComents.update({
                nombre: event.target.nombre.value,
                titulo: event.target.titulo.value,
                comentario:event.target.comentario.value
            });
            modo = CREATE;
            document.getElementById("btn-coments").value = CREATE;
            break;
    }

    formInformation.reset();
}


//<i class="icon-settings"></i>