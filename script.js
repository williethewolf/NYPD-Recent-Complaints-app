const currentTime = new Date();
const previousDay = new Date(currentTime.getTime());
previousDay.setDate(currentTime.getDate() - 1);
previousDay.toISOString().slice(0,10)

// console.log(previousDay.toISOString().slice(0,10))

apiUrl = `https://data.cityofnewyork.us/resource/erm2-nwe9.json?agency=NYPD&$where=created_date  > '${previousDay.toISOString().slice(0,10)}'` //${currentTime}`


//HTML FETCHERS and Event Listeners
boroughButtons = document.querySelector("#borough-nav")
boroughButtons.addEventListener("click",passBoroughName)
resultsButton = document.querySelector("#results-button")
resultsButton.addEventListener("click",showResults)
numberOfResultsInput =document.querySelector("#results-n") 
resultsPanel =document.querySelector("#results-panel") 
resultsPanel.addEventListener("click",showHiddenInfo)

//VARIABLES
let boroughsToFetch = []
let complaintsArray = []
numberOfResultsInput.value = 10;

//REFERENCE FETCH
fetch(apiUrl)
.then (response => response.json())
.then(response => console.log(response))


//Borough buttons
function passBoroughName(evt){
    evt.preventDefault();
    resetSearch()
    if(!evt.target.classList.contains("selected-button")){
    evt.target.classList.add("selected-button")
    
    boroughsToFetch.push(evt.target.innerText.toUpperCase())
    }else{
        evt.target.classList.remove("selected-button")
        boroughsToFetch = boroughsToFetch.filter((b)=>b!=evt.target.innerText.toUpperCase()) 
    }

    // console.log(boroughsToFetch)
    
}

//FETCH corresponding data set from API and filter by user input
function showResults(evt) {
    evt.preventDefault();
    resetSearch()
    fetch(apiUrl)
        .then (response => response.json())
        .then(data => filteResultsByBorough(data))
        .then(curatedInfo => {populateTable(curatedInfo); return curatedInfo})
        .then(publish => {console.log(publish); return})
        .catch(error => alert("Somethin went wrong",error))
        
}

function filteResultsByBorough(data){
    { boroughsToFetch.forEach ((bTF)=> data.forEach((dRS) =>{if (bTF == dRS.borough){ complaintsArray.push(dRS)} })); return complaintsArray.sort((a,b)=>{return (a.created_date > b.created_date)? -1 : ((a.created_date < b.created_date)? 1 : 0)})}
}

//POPULATE site
function populateTable (complaintsArray){
    let numberRequestedbyUser 
    if (numberOfResultsInput.value <= complaintsArray.length ){
        numberRequestedbyUser =numberOfResultsInput.value
    }else{
        numberRequestedbyUser = complaintsArray.length
    }
    // console.log(numberRequestedbyUser)
    for (let i =0; i<numberRequestedbyUser; i++){
    //image div
    const imgDiv = document.createElement("div")
    // const image = document.createElement('img')
    const image = document.createElement('video')
    const imagesrc = document.createElement('source')
    image.loop = true;
    image.autoplay = true;
    image.setAttribute("width","100%")
    imagesrc.src="./imgs/siren.webm"
    imagesrc.type="video/webm"
    // image.src = "./imgs/siren.webm"
    image.appendChild(imagesrc)
    imgDiv.appendChild(image)
    //date
    const dateDiv = document.createElement("div")
    // console.log(String(complaintsArray[i].created_date))
    dateDiv.innerHTML = convertFromStringToDate(String(complaintsArray[i].created_date))
    dateDiv.setAttribute("class","time-div")
    //dateDiv.textContent = complaintsArray[i].closed_date
    //title div
    const titleDiv = document.createElement("div")
    titleDiv.textContent = complaintsArray[i].complaint_type
    //borough div
    const boroughDiv = document.createElement("div")
    boroughDiv.textContent = abbreviateNames(complaintsArray[i].borough)
    boroughDiv.setAttribute("class","borough-div")
    //button div
    const btnDiv = document.createElement("div")
    const button = document.createElement("button")
    button.innerHTML = "More"
    button.setAttribute("data-target",`description${i}`)
    btnDiv.appendChild(button)
    //resolution div
    const descDiv = document.createElement("div")
    descDiv.setAttribute("id", `description${i}`);
    descDiv.setAttribute("class", "long hidden")
    let popoResponse
    if(complaintsArray[i].resolution_description == undefined)
    { popoResponse = `The case is still open`
    }else{
        popoResponse = complaintsArray[i].resolution_description
    }

    descDiv.textContent = `${complaintsArray[i].descriptor} / Police Response: ${popoResponse}`
    //appending
    resultsPanel.appendChild(imgDiv)
    resultsPanel.appendChild(dateDiv)
    resultsPanel.appendChild(titleDiv)
    resultsPanel.appendChild(boroughDiv)
    resultsPanel.appendChild(btnDiv)
    resultsPanel.appendChild(descDiv)
    // complaintsArray[i]
 }
}

function showHiddenInfo(evt){
    const target = evt.target
    if (target.localName=="button"){
        const dataTarget =target.getAttribute('data-target')
        const hiddenPanel = document.querySelector(`#${dataTarget}`)
        
        if(hiddenPanel.classList.contains("hidden")){
            hiddenPanel.classList.remove("hidden")
        }else{
            hiddenPanel.classList.add("hidden")
        }
    }else{

    }
}
//Garbage API dates into human formatting
function convertFromStringToDate(dateFromApi) {
    // console.log("se ejecuta")
    // console.log(dateFromApi)
    const cleandate = new Date(dateFromApi)
    // console.log(cleandate)
    return cleandate.toLocaleString().replace(',', '<br>')
}

function abbreviateNames(name){
    if(name == "MANHATTAN"){
        return "MH"
    }else if
    (name == "BROOKLYN"){
        return "BK"
    }else if
    (name == "QUEENS"){
        return "QS"
    }else if
    (name == "STATEN ISLAND"){
        return "SI"
    }else if
    (name == "BRONX"){
        return "BX"
    }

}


//For cleanup
function resetSearch(){
    complaintsArray = []
    resultsPanel.innerHTML=""
}
