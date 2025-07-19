//   copied from bootstrp website to make form inputs to be required but in a good looking way 

(function(){
    'use strict'
    const forms=document.querySelectorAll('.validated-form')
    Array.from(forms)
        .forEach(function (form){
            form.addEventListener('submit',function (event){
                if(!form.checkValidity()){
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            },false)
        })
})()
