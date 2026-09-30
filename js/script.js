var YOUTUBE_ID="";/* paste the video ID here, e.g. dQw4w9WgXcQ */
var T = [
  ["Yash Anand", "images/yash-anand.jpg", "https://www.linkedin.com/in/yashanand-574677371/"],
  ["Kazima Fatima", "images/kazima-fatima.png", "https://www.linkedin.com/in/kazima-fatima-754614368/"],
  ["Gargee Kakaty", "images/gargee-kakaty.png", "https://www.linkedin.com/in/gargee-kakaty-b20124323/"],
  ["Dipesh Giri", "images/dipesh-giri.png", "https://www.linkedin.com/in/dipesh-giri-26188b323/"],
  ["Rajuram D", "images/rajuram-d.jpg", "https://www.linkedin.com/in/rajuram14/"],
  ["Hemant Dubey", "images/hemant-dubey.jpg", "https://www.linkedin.com/in/hemant-dubey-96233b419/"],
  ["Nilesh", "images/nilesh.jpg", ""],
  ["Harshit Dwivedi", "images/harshit-dwivedi.jpg", "https://www.linkedin.com/in/harshit-dwivedi-aa8804434/"],
  ["Mahak Jaiswal", "images/mahak-jaiswal.jpeg", "https://www.linkedin.com/in/mahak-jaiswal-200b47439"],
  ["Soniya Limbu", "images/soniya-limbu.png", "https://www.linkedin.com/in/soniya-limbu-854835418/"],
  ["Sahel Sasmal", "images/sahel-sasmal.jpg", "https://www.linkedin.com/in/sahel-sasmal-8706b4332/"],
  ["Sagarika Chatterjee", "images/sagarika-chatterjee.jpg", ""]
];
document.getElementById("teamGrid").innerHTML = T.map(function(t) {
  return '<div class="m">' +
    '<img class="av" src="' + t[1] + '" alt="' + t[0] + '">' +
    '<h3>' + t[0] + '</h3>' +
    '<p class="role">Role: to be added</p>' +
    (t[2]
      ? '<a href="' + t[2] + '" target="_blank" rel="noopener">LinkedIn</a>'
      : '<span class="role">LinkedIn: to be added</span>') +
    '</div>';
}).join("");
if(YOUTUBE_ID){document.getElementById("video").innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+YOUTUBE_ID+'" title="Arth.Find user guide" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>'}
var R={
    "":"home",
    "faq":"faq",
    "privacy":"privacy",
    "docs":"docs",
    "team":"team",
    "feedback":"feedback"
};
function route(){var k=location.hash.replace(/^#\/?/,"");var id=R[k]||"home";
document.querySelectorAll(".page").forEach(function(p){p.classList.toggle("on",p.id===id)});
document.querySelectorAll("nav a").forEach(function(a){var on=(a.getAttribute("href").replace(/^#\/?/,"")||"")===(id==="home"?"":id);on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
window.scrollTo(0,0)}
addEventListener("hashchange",route);route();
