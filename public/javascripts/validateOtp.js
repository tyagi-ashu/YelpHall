//not using speak easy here directly because its not browser compatible
(function(){
    let div = document.getElementById("otp")
    let btnotp = document.getElementById("btnotp")
    let btnverif = document.getElementById("btnverif")
    let form=document.getElementById("otp-validate")
    btnverif.classList.toggle('d-none')
    btnverif.disabled=true
    div.classList.toggle('d-none')
    let secret=''
    let token=''
    let tokenValidates=false

    btnotp.onclick=async()=>{
        btnotp.classList.toggle('d-none')
        btnotp.disabled=true
        btnverif.classList.toggle('d-none')
        btnverif.disabled=false
        div.classList.toggle('d-none')

        const res = await fetch('http://localhost:3000/api/totp-secret');
        const data = await res.json();
        secret=data.secret
        token=data.token
        userData.token=token

        await fetch('http://localhost:3000/send-mail',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
    }
    function OTPInput() {
        let inputs = document.querySelectorAll('#otp > input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', function() {
                if (this.value.length > 1) {
                    this.value = this.value[0]; 
                }
                if (this.value !== '' && i < inputs.length - 1) {
                    inputs[i + 1].focus();
                }
            });

            inputs[i].addEventListener('keydown', function(event) {
                if (event.key === 'Backspace') {
                    this.value = '';
                    if (i > 0) {
                        inputs[i - 1].focus();   
                    }
                }
            });
        }
    }

    OTPInput();

    form.addEventListener('submit', async function(event) {
        event.preventDefault();     // Always prevent default first
        event.stopPropagation();

        let otp = '';
        document.querySelectorAll('#otp > input').forEach(input => otp += input.value);

        try {
            const res = await fetch('http://localhost:3000/api/totp-secret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ secret, otp })
            });

            const data = await res.json();
            tokenValidates = data.tokenValidates;
            const h5 = document.querySelector('h5');

            if (!tokenValidates) {
                h5.textContent = "WRONG OTP!";
                console.log(token)
                console.log('OTP invalid, not submitting form');
            } else {
                h5.textContent = "REDIRECTING...";
                console.log('OTP valid, submitting form');
                form.submit(); // This bypasses the submit event, so it won't loop
            }
        } catch (err) {
            console.error('OTP validation failed:', err);
        }
    })
})()
