document.addEventListener("DOMContentLoaded",function(){
    const searchButton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle =document.querySelector(".easy-progress");
    const mediumProgressCircle =document.querySelector(".medium-progress");
    const hardProgressCircle =document.querySelector(".hard-progress");
    const easyLabel=document.getElementById("easy-label");
    const mediumLabel=document.getElementById("medium-label");
    const hardLabel=document.getElementById("hard-label");
    const cardStatsContainer=document.querySelector(".stats-card");

    const themeCheckbox = document.getElementById("theme-checkbox");
    const themeLabel = document.getElementById("theme-label");

    function applyTheme(theme) {
        document.body.className = theme;
        themeCheckbox.checked = theme === "light";
        themeLabel.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
        localStorage.setItem("theme", theme);
    }

    // Load saved theme on page load
    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);

    // Toggle theme 
    themeCheckbox.addEventListener("change", () => {
        const newTheme = themeCheckbox.checked ? "light" : "dark";
        applyTheme(newTheme);
    });

    function validateUsername(username){
        if (username.trim()==="") {
            alert("Username should not be empty");
            return false;
        }
        const regex=/^[a-zA-Z0-9_-]{1,39}$/;
        const isMatching =regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }
    async function fetchUserDetails(username){
        
        try{
            searchButton.textContent="Searching";
            searchButton.disabled=true;
            const proxyUrl='https://cors-anywhere.herokuapp.com/'
            const targetUrl='https://leetcode.com/graphql/';
            const myHeaders =new Headers();
            myHeaders.append("content-type","application/json");

            const graphql = JSON.stringify({
                query: `
                  query userSessionProgress($username: String!) {
                    allQuestionsCount {
                      difficulty
                      count
                    }
                    matchedUser(username: $username) {
                      submitStats {
                        acSubmissionNum {
                          difficulty
                          count
                          submissions
                        }
                        totalSubmissionNum {
                          difficulty
                          count
                          submissions
                        }
                      }
                    }
                  }
                `,
                variables: { username: username }
              });
              
            const requestOption={
                method:"POST",
                headers:myHeaders,
                body:graphql,
                redirect:"follow"
            };
                const response =await fetch(proxyUrl+targetUrl,requestOption);
                if (!response.ok) {
                    throw new Error("unable to fetch the user details");
                }
                const parseddata =await response.json();
                console.log("Logging data:",parseddata);
                displayUserData(parseddata);
        }
        catch(error){
            statsContainer.innerHTML=`<p>No data found</p>`
        }
        finally{
            searchButton.textContent="Search";
            searchButton.disabled=false;
        }
    }

    function updateProgress(solved,total,label,circle){
        const progressDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.textContent=`${solved}/${total}`;
    }
    
    
    function displayUserData(parseddata){
        const totalQues=parseddata.data.allQuestionsCount[0].count;
        const totalEasyQues=parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues=parseddata.data.allQuestionsCount[2].count;
        const totalHardQues=parseddata.data.allQuestionsCount[3].count;

        const solvedTotalQues =parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues =parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues =parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues =parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);

        const cardsData =[
            {label:"Overall Submissions:",value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:"Overall Easy Submissions:",value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:"Overall Medium Submissions:",value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:"Overall Hard Submissions:",value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ];
        cardStatsContainer.innerHTML=cardsData.map(
            data=>
                `<div class="card">
                <h4>${data.label}</h4>
                <p>${data.value}</p>
                </div>`
        ).join("")
        
    }
    searchButton.addEventListener('click',function(){
        const username=usernameInput.value;
        console.log(username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    })
})
