// Import stylesheets
import './style.css';

const getStatements = async () => {
  var myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    'Basic MTYwNDAzNjQwYzdmZjdkZGZmM2E3Mjg0ZmUzM2QxY2MzMGZkOTQ2Zjo0MmY2ZWE1ODFiNjJiNjIyN2U2MjZhZDIyYzhiZWFiMmM4MzY0NjFk'
  );
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('X-Experience-API-Version', '1.0.0');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  const getJson = async () => {
    const res = await fetch(
      'https://theodi.learninglocker.net/data/xAPI/Statements',
      requestOptions
    );
    const json = await res.json();

    // console.log(json.statements[0].object.id.includes('mit-moral-machine-test-limited'))

    const filteredData = await json.statements.filter((statement) =>
      statement.object.id.includes(
        'https://learning.theodi.org/xapi/activities/mit-moral-machine-test-limited'
      )
    );

    const filteredVerb = await filteredData.filter((verb) =>
      verb.verb.id.includes('answered')
    );

//   only show the int 1 in the array
const getAnswerOne = filteredVerb.filter((a)=>  a.result.response === '1')
const getAnswerTwo = filteredVerb.filter((a)=>  a.result.response === '2')

const firstAnswerArr = getAnswerOne.map((a)=>{
    return a.result.response
})
const secondAnswerArr = getAnswerTwo.map((a)=>{
  return a.result.response
})

// create object with number of responses - lenght of firstanswerarr and secondanswerarr
const answerObj = {
    firstAnswer: firstAnswerArr.length,
    secondAnswer: secondAnswerArr.length
}

    console.log(answerObj);
    console.log(filteredData.length);

    return moralMachine;
  };

  return await getJson();
};

getStatements().then((data) => console.log(data));

// output/genearte new json file
const createJson = () => {
const fs = require('fs');
const data = JSON.stringify(getStatements());
fs.writeFile('data.json', data, (err) => {
  if (err) throw err;
  console.log('Data written to file');
});
}
// call the createjson() function once a day
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
const job = schedule.scheduleJob(rule, function(){
    createJson();
});
// run the output once a day
// const schedule = require('node-schedule');
// const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(0, 6)];
// rule.hour = 0;
// rule.minute = 0;


// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>JS Starter</h1>`;
