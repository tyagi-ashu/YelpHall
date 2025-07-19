let disable_dates=[]
for(let i=0;i<hall.books.length;i++){
    hall.books[i].bookedDate.timeSlot.forEach((booked,j)=>{
        if(booked.length===4){
            disable_dates.push(hall.books[i].bookedDate.date[j])
        }
    })
}
const config1={
    mode:"multiple",
    disable:disable_dates,
    dateFormat: "Y-m-d",
    conjunction: " and ",
    altInput: true,
    inline:true,
    altFormat: "F j, Y",
    minDate: "today",
    maxDate: new Date().fp_incr(730), // 730 days=2 years from now
}
flatpickr("input[type=date]", config1);

//for recepit
let price=0
document.getElementById('show-pop').onclick=function showPopup() {
    document.getElementById('popup').style.display = 'block';
}

document.getElementById('hide-pop').onclick=function hidePopup() {
    document.getElementById('popup').style.display = 'none';
}

const popup = document.getElementById('popup');
const header = document.getElementById('popupHeader');
let offsetX = 0, offsetY = 0, isDragging = false;

header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
});

function drag(e) {
    if (isDragging) {
        popup.style.left = (e.clientX - offsetX) + 'px';
        popup.style.top = (e.clientY - offsetY) + 'px';
    }
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

(function(){
    const dateInput=document.getElementById('date-selector')
    const noDate=document.getElementById('no-date-placeholder')
    const appDiv=document.getElementById('appending-div')
    const timeInput=document.getElementById('hidden-input-1')
    const priceInput=document.getElementById('hidden-input-2')
    const receipt=document.getElementById('appending-article')
    const priceDisplay=document.getElementById('price-tag')

    let dateList=[]
    let timeList=[]

    dateInput.addEventListener('change',function(){
        appDiv.innerHTML=''
        receipt.innerHTML=''
        price=0
        dateList=dateInput.value.split(" and ")
        timeList=[]
        if(dateList.length && dateList[0]!==''){
            for(let date of dateList){
                const receipt_date=document.createElement('div')
                receipt_date.style.marginBottom="5px"
                receipt_date.id=`${date}`
                const h7=document.createElement('h7')
                h7.textContent="-----------"+date+"-----------"
                receipt_date.appendChild(h7)
                receipt.appendChild(receipt_date)

                timeList.push([])

                const extraDiv=document.createElement('div')
                extraDiv.classList.add('extra-div')
                const timeHeading=document.createElement('h5')
                timeHeading.textContent=date
                const time1=document.createElement('button')
                time1.innerText="10:00 - 13:00"
                time1.classList.add('btn','btn-outline-info','time-btn')
                const time2=document.createElement('button')
                time2.innerText="13:00 - 16:00"
                time2.classList.add('btn','btn-outline-info','time-btn')
                const time3=document.createElement('button')
                time3.innerText="13:00 - 19:00"
                time3.classList.add('btn','btn-outline-info','time-btn')
                const time4=document.createElement('button')
                time4.innerText="19:00 - 22:00"
                time4.classList.add('btn','btn-outline-info','time-btn')

                extraDiv.appendChild(timeHeading)
                extraDiv.appendChild(time1)
                extraDiv.appendChild(time2)
                extraDiv.appendChild(time3)
                extraDiv.appendChild(time4)
                appDiv.appendChild(extraDiv)
            }
            document.querySelectorAll('.time-btn').forEach(buttonElement => {
                const h5=buttonElement.parentElement.firstElementChild
                const index=dateList.indexOf(h5.textContent)
                if(index===-1){
                    console.error('error-> dateList.indexOf(h5.textContent)===-1')
                }
                for(let i=0;i<hall.books.length;i++){
                    const index2=hall.books[i].bookedDate.date.indexOf(new Date(h5.textContent).toISOString())
                    if(index2!==-1){
                        if(hall.books[i].bookedDate.timeSlot[index2].includes(buttonElement.innerText)){
                            buttonElement.disabled=true
                            break;
                        }
                    }
                }
                const receipt_time=document.createElement('p')
                receipt_time.style.margin="2px"
                const receipt_date=document.getElementById(`${h5.textContent}`)
                receipt_time.textContent="-> "+buttonElement.textContent
                buttonElement.onclick=()=>{
                    if(buttonElement.classList.contains('btn-outline-info')){
                        receipt_date.appendChild(receipt_time)
                        buttonElement.classList.remove('btn-outline-info')
                        price+=hall.price
                        buttonElement.classList.add('btn-primary')
                        timeList[index].push(buttonElement.textContent)
                        timeInput.value=JSON.stringify(timeList)
                        priceInput.value=JSON.stringify(price)
                    }else{
                        receipt_time.remove()
                        price-=hall.price
                        const index3=timeList[index].indexOf(buttonElement.textContent)
                        timeList[index].splice(index3,1)
                        timeInput.value=JSON.stringify(timeList)
                        priceInput.value=JSON.stringify(price)
                        buttonElement.classList.remove('btn-primary')
                        buttonElement.classList.add('btn-outline-info')      
                    }
                priceDisplay.textContent=price
                }
                priceDisplay.textContent=price
            })
            noDate.style.display='none'
        }else{
            noDate.style.display='block'
        }
    })
})()
